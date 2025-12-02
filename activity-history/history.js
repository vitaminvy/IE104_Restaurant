import i18nService from "../assets/script/i18n-service.js";

const HISTORY_STORAGE_KEY = "activityHistory";
let latestRendered = [];
let lastDetailTrigger = null;

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

const statusFallback = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn tất",
  cancelled: "Đã hủy",
};

const typeFallback = {
  reservation: "Đặt bàn",
  order: "Đặt món",
};

const typeIcons = {
  reservation: "🪑",
  order: "🍽",
};

function t(key, fallback = "") {
  const val = i18nService.t(key);
  if (val && val !== key) return val;
  return fallback || key;
}

function getStatusLabel(code) {
  return t(`history.status.${code}`, statusFallback[code] || code);
}

function getTypeLabel(code) {
  return t(`history.types.${code}`, typeFallback[code] || code);
}

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
  const hiddenCount =
    items.length > 3
      ? ` ${t("history.card.more_items", "+{count} món khác").replace("{count}", items.length - 3)}`
      : "";
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
  latestRendered = filtered;

  filtered.forEach((item, index) => {
    const article = document.createElement("article");
    article.className = "history-card";

    const dateLabel = safeFormatDateTime(item.createdAt);
    const statusLabel = getStatusLabel(item.status);
    const typeLabel = getTypeLabel(item.type);
    const icon = typeIcons[item.type] || "•";
    const totalDisplay =
      typeof item.total === "number"
        ? formatCurrency(item.total, item.currency)
        : item.total;

    const primaryDetails =
      item.type === "reservation"
        ? `
            <div><span class="history-card__label">${t("history.card.arrival_time", "Ngày/giờ đến: ")}</span>${safeFormatDateTime(item.arrivalAt || item.createdAt)}</div>
            <div><span class="history-card__label">${t("history.card.people", "Số người: ")}</span>${item.people || "-"}</div>
            <div><span class="history-card__label">${t("history.card.table", "Bàn dự kiến: ")}</span>${item.table || t("history.card.table_unassigned", "Đang sắp xếp")}</div>
          `
        : `
            <div><span class="history-card__label">${t("history.card.total", "Tổng tiền: ")}</span>${totalDisplay || "-"}</div>
            <div><span class="history-card__label">${t("history.card.items", "Món: ")}</span>${buildItemsSummary(item.items || [])}</div>
          `;

    const noteValue =
      item.type === "order"
        ? item.address || item.note || ""
        : item.note || "";
    const noteLabel =
      item.type === "order" && item.address
        ? t("history.card.address", "Địa chỉ: ")
        : t("history.card.note", "Ghi chú: ");
    const noteBlock = noteValue
      ? `<div><span class="history-card__label">${noteLabel}</span>${noteValue}</div>`
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
          <button class="history-card__btn" type="button" data-detail-idx="${index}" aria-label="${t("history.actions.view_detail_aria", "Xem chi tiết")} ${item.id}">
            ${t("history.actions.view_detail", "Xem chi tiết")}
          </button>
        </div>
      </div>
    `;

    listDOM.appendChild(article);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const init = async () => {
    await i18nService.init();
    document.getElementById("filterType").addEventListener("change", renderList);
    document.getElementById("filterStatus").addEventListener("change", renderList);
    document.getElementById("filterFrom").addEventListener("change", renderList);
    document.getElementById("filterTo").addEventListener("change", renderList);
    document
      .getElementById("historyList")
      .addEventListener("click", handleDetailClick);
    setupDetailModal();
    renderList();
  };

  init();
});

document.addEventListener("language-changed", () => {
  renderList();
});

function handleDetailClick(event) {
  const btn = event.target.closest("[data-detail-idx]");
  if (!btn) return;
  const idx = parseInt(btn.dataset.detailIdx, 10);
  if (Number.isNaN(idx) || !latestRendered[idx]) return;
  lastDetailTrigger = btn;
  openDetail(latestRendered[idx]);
}

function setupDetailModal() {
  const detail = document.getElementById("historyDetail");
  const overlay = document.querySelector(".history-detail__overlay");
  const closeBtn = document.querySelector(".history-detail__close");
  if (!detail || !overlay || !closeBtn) return;

  const close = () => {
    if (detail.contains(document.activeElement)) {
      if (lastDetailTrigger && typeof lastDetailTrigger.focus === "function") {
        lastDetailTrigger.focus();
      } else if (document.activeElement && typeof document.activeElement.blur === "function") {
        document.activeElement.blur();
      }
    }
    detail.setAttribute("aria-hidden", "true");
    detail.setAttribute("inert", "");
    detail.classList.remove("is-open");
    document.body.style.overflow = "";
    lastDetailTrigger = null;
  };

  overlay.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && detail.classList.contains("is-open")) {
      close();
    }
  });
}

function openDetail(item) {
  const detail = document.getElementById("historyDetail");
  const body = document.getElementById("historyDetailBody");
  if (!detail || !body) return;
  detail.removeAttribute("inert");

  const statusLabel = getStatusLabel(item.status);
  const typeLabel = getTypeLabel(item.type);
  const icon = typeIcons[item.type] || "•";

  const paymentLines =
    item.type === "order"
      ? `
        <div class="history-detail__totals">
          <div><span>${t("history.detail.subtotal", "Tổng phụ")}</span><strong>${formatCurrency(item.subtotal, item.currency)}</strong></div>
          ${item.discount ? `<div><span>${t("history.detail.discount", "Giảm giá")}</span><strong>-${formatCurrency(item.discount, item.currency)}</strong></div>` : ""}
          ${
            item.shipping !== undefined && item.shipping !== null
              ? `<div><span>${t("history.detail.shipping", "Phí giao")}</span><strong>${formatCurrency(item.shipping, item.currency)}</strong></div>`
              : ""
          }
          <div><span>${t("history.detail.total", "Tổng cộng")}</span><strong>${formatCurrency(item.total, item.currency)}</strong></div>
        </div>
        <div class="history-detail__row"><span>${t("history.detail.payment", "Thanh toán")}</span><span class="history-detail__value">${item.paymentMethod || "—"}</span></div>
        ${
          item.coupon
            ? `<div class="history-detail__row"><span>${t("history.detail.coupon", "Mã khuyến mãi")}</span><span class="history-detail__value">${item.coupon}</span></div>`
            : ""
        }
      `
      : "";

  const contactLines =
    item.type === "reservation" && item.contact
      ? `
        <div class="history-detail__row"><span>${t("history.detail.customer", "Khách")}</span><span class="history-detail__value">${item.contact.name || "—"}</span></div>
        <div class="history-detail__row"><span>${t("history.detail.phone", "Điện thoại")}</span><span class="history-detail__value">${item.contact.phone || "—"}</span></div>
        <div class="history-detail__row"><span>${t("history.detail.email", "Email")}</span><span class="history-detail__value">${item.contact.email || "—"}</span></div>
      `
      : "";

  const itemsBlock =
    item.type === "order" && Array.isArray(item.items)
      ? `
        <div class="history-detail__items">
          ${item.items
            .map(
              (it) => `
              <div class="history-detail__item">
                <span>${it.name || it.titleKey || "Món"}</span>
                <strong>x${it.qty || it.quantity || 1}</strong>
              </div>`
            )
            .join("")}
        </div>
      `
      : "";

  const orderAddressRow =
    item.type === "order" && item.address && item.address.trim()
      ? `<div class="history-detail__row"><span>${t("history.detail.address", "Địa chỉ")}</span><span class="history-detail__value">${item.address}</span></div>`
      : "";

  const detailNoteRow =
    item.note && item.note.trim()
      ? `<div class="history-detail__row"><span>${t("history.detail.note", "Ghi chú")}</span><span class="history-detail__value">${item.note}</span></div>`
      : "";

  body.innerHTML = `
    <div class="history-detail__header">
      <div class="history-card__icon" aria-hidden="true">${icon}</div>
      <div>
        <p class="history-detail__title">${typeLabel} • ${item.id}</p>
        <div class="history-detail__meta">
          <span>${t("history.detail.placed_at", "Đặt lúc")} ${safeFormatDateTime(item.createdAt)}</span>
          ${
            item.arrivalAt
              ? `<span>${t("history.detail.arrive_at", "Thời gian đến")} ${safeFormatDateTime(item.arrivalAt)}</span>`
              : ""
          }
        </div>
      </div>
      <span class="history-detail__status status-${item.status}">${statusLabel}</span>
    </div>

    <div class="history-detail__section">
      <h4>${t("history.detail.main_info", "Thông tin chính")}</h4>
      ${
        item.type === "reservation"
          ? `
            <div class="history-detail__row"><span>${t("history.detail.people", "Số người")}</span><span class="history-detail__value">${item.people || "—"}</span></div>
            <div class="history-detail__row"><span>${t("history.detail.table", "Bàn")}</span><span class="history-detail__value">${item.table || t("history.detail.table_unassigned", "Đang sắp xếp")}</span></div>
            ${contactLines}
          `
          : `
            <div class="history-detail__row"><span>${t("history.detail.items_count", "Số món")}</span><span class="history-detail__value">${item.items ? item.items.length : 0}</span></div>
            ${itemsBlock}
            ${paymentLines}
            ${orderAddressRow}
          `
      }
      ${detailNoteRow}
    </div>
  `;

  detail.setAttribute("aria-hidden", "false");
  const closeBtn = document.querySelector(".history-detail__close");
  if (closeBtn && typeof closeBtn.focus === "function") {
    closeBtn.focus();
  }
  detail.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
