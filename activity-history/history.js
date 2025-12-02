const HISTORY_STORAGE_KEY = "activityHistory";

const demoActivities = [
  {
    id: "R2031",
    type: "reservation",
    status: "confirmed",
    createdAt: "2025-12-20T12:30:00+07:00",
    arrivalAt: "2025-12-20T19:30:00+07:00",
    people: 4,
    table: "B12",
    note: "Kỷ niệm 5 năm",
  },
];

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const typeLabels = {
  reservation: "Đặt bàn",
  order: "Đặt món",
};

const typeIcons = {
  reservation: "🪑",
  order: "🍽",
};

function formatCurrency(value, currency = "USD") {
  if (typeof value !== "number") return value || "-";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    return `$${value.toFixed(2)}`;
  }
}

function loadStoredActivities() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function getActivities() {
  const stored = loadStoredActivities();
  if (Array.isArray(stored) && stored.length) {
    return stored;
  }
  return demoActivities;
}

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const safeFormatDateTime = (value) => {
  try {
    return value ? formatDateTime(value) : "—";
  } catch (error) {
    return "—";
  }
};

function buildItemsSummary(items = []) {
  const summary = items
    .slice(0, 3)
    .map((item) => {
      const label = item.name || item.titleKey || "Món";
      const qty = item.qty || item.quantity || 1;
      return `${label} x${qty}`;
    });
  const hiddenCount = items.length > 3 ? ` +${items.length - 3} món khác` : "";
  return summary.join(", ") + hiddenCount;
}

function renderList() {
  const listDOM = document.getElementById("historyList");
  const emptyDOM = document.getElementById("historyEmpty");
  const activities = getActivities();
  const typeFilter = document.getElementById("filterType").value;
  const statusFilter = document.getElementById("filterStatus").value;
  const fromDate = document.getElementById("filterFrom").value;
  const toDate = document.getElementById("filterTo").value;
  const search = document.getElementById("searchBox").value.trim().toLowerCase();

  listDOM.innerHTML = "";

  const filtered = activities
    .filter((item) => typeFilter === "all" || item.type === typeFilter)
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .filter((item) => {
      if (!fromDate && !toDate) return true;
      const created = item.createdAt ? new Date(item.createdAt) : null;
      if (!created || Number.isNaN(created)) return true;
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      if (from && created < from) return false;
      if (to) {
        const endOfDay = new Date(to);
        endOfDay.setHours(23, 59, 59, 999);
        if (created > endOfDay) return false;
      }
      return true;
    })
    .filter((item) => {
      if (!search) return true;
      const textStack = [
        item.id,
        item.note || "",
        item.table || "",
        item.arrivalAt || "",
        item.total || "",
        item.items ? buildItemsSummary(item.items) : "",
      ]
        .join(" ")
        .toLowerCase();
      return textStack.includes(search);
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

  if (!filtered.length) {
    listDOM.innerHTML = "";
    emptyDOM.style.display = "block";
    emptyDOM.textContent = "Không tìm thấy hoạt động nào khớp bộ lọc.";
    return;
  }

  emptyDOM.style.display = "none";

  filtered.forEach((item) => {
    const article = document.createElement("article");
    article.className = "history-card";

    const dateLabel = safeFormatDateTime(item.createdAt);
    const statusLabel = statusLabels[item.status] || item.status;
    const typeLabel = typeLabels[item.type] || item.type;
    const icon = typeIcons[item.type] || "•";
    const totalDisplay =
      typeof item.total === "number"
        ? formatCurrency(item.total, item.currency)
        : item.total;

    const primaryDetails =
      item.type === "reservation"
        ? `
            <div><span class="history-card__label">Ngày/giờ đến: </span>${safeFormatDateTime(item.arrivalAt || item.createdAt)}</div>
            <div><span class="history-card__label">Số người: </span>${item.people || "-"}</div>
            <div><span class="history-card__label">Bàn dự kiến: </span>${item.table || "Đang sắp xếp"}</div>
          `
        : `
            <div><span class="history-card__label">Tổng tiền: </span>${totalDisplay || "-"}</div>
            <div><span class="history-card__label">Món: </span>${buildItemsSummary(item.items || [])}</div>
          `;

    const noteBlock = item.note
      ? `<div><span class="history-card__label">Ghi chú: </span>${item.note}</div>`
      : "";

    article.innerHTML = `
      <div class="history-card__icon" aria-hidden="true">${icon}</div>
      <div class="history-card__content">
        <div class="history-card__top">
          <span class="history-card__id">${item.id}</span>
          <span class="history-card__status status-${item.status}">${statusLabel}</span>
        </div>
        <div class="history-card__meta">
          <span class="history-card__pill">${typeLabel}</span>
          <span class="history-card__pill">${dateLabel}</span>
        </div>
        <div class="history-card__details">
          ${primaryDetails}
          ${noteBlock}
        </div>
        <div class="history-card__actions">
          <a class="history-card__btn" href="#" aria-label="Xem chi tiết ${item.id}">Xem chi tiết</a>
          ${item.status !== "cancelled" ? '<a class="history-card__btn" href="#">Đặt lại</a>' : ""}
        </div>
      </div>
    `;

    listDOM.appendChild(article);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("filterType").addEventListener("change", renderList);
  document.getElementById("filterStatus").addEventListener("change", renderList);
  document.getElementById("filterFrom").addEventListener("change", renderList);
  document.getElementById("filterTo").addEventListener("change", renderList);
  document.getElementById("searchBox").addEventListener("input", renderList);
  renderList();
});
