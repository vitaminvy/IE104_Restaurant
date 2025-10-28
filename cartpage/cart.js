// =============== CART LOGIC ===============
document.addEventListener("DOMContentLoaded", () => {
  const shippingCost = 6.0; // phí ship cố định (theo thiết kế)
  const subtotalEl = document.querySelector(".totals__right:nth-child(2)");
  const totalEl = document.querySelector(".totals__total .totals__right");
  const rows = document.querySelectorAll(".cart__table tbody tr");

  // Load dữ liệu nếu có trong localStorage
  const savedQuantities = JSON.parse(localStorage.getItem("CART_QTY")) || {};

  rows.forEach((row, index) => {
    const input = row.querySelector(".qty__input");
    const btnMinus = row.querySelectorAll(".qty__btn")[0];
    const btnPlus = row.querySelectorAll(".qty__btn")[1];
    const priceEl = row.querySelector(".cart__price");
    const subtotalCell = row.querySelector(".cart__subtotal");

    // ===== Nút xóa sản phẩm =====
    const removeBtn = row.querySelector(".remove__btn");
    removeBtn.addEventListener("click", () => {
      row.remove();
      saveQuantities();
      updateTotal();
    });

    const price = parseFloat(priceEl.textContent.replace("$", ""));

    if (savedQuantities[index]) {
      input.value = savedQuantities[index];
    }

    const updateSubtotal = () => {
      const qty = parseInt(input.value);
      const subtotal = price * qty;
      subtotalCell.textContent = `$${subtotal.toFixed(2)}`;
      saveQuantities();
      updateTotal();
    };

    btnMinus.addEventListener("click", () => {
      let qty = parseInt(input.value);
      if (qty > 1) {
        input.value = qty - 1;
        updateSubtotal();
      }
    });

    btnPlus.addEventListener("click", () => {
      let qty = parseInt(input.value);
      input.value = qty + 1;
      updateSubtotal();
    });

    input.addEventListener("input", () => {
      let qty = parseInt(input.value);
      if (isNaN(qty) || qty < 1) qty = 1;
      input.value = qty;
      updateSubtotal();
    });

    updateSubtotal();
  });

  // Lưu số lượng vào localStorage
  function saveQuantities() {
    const quantities = {};
    rows.forEach((row, i) => {
      const val = parseInt(row.querySelector(".qty__input").value);
      quantities[i] = val;
    });
    localStorage.setItem("CART_QTY", JSON.stringify(quantities));
  }

  // Cập nhật subtotal & total toàn trang
  function updateTotal() {
    let subtotal = 0;

    // Lấy lại danh sách các dòng còn tồn tại trong DOM
    const currentRows = document.querySelectorAll(".cart__table tbody tr");

    currentRows.forEach((row) => {
      const sub = parseFloat(
        row.querySelector(".cart__subtotal").textContent.replace("$", "")
      );
      subtotal += sub;
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;

    // Nếu không còn hàng nào → hiển thị thông báo
    if (currentRows.length === 0) {
      document.querySelector(".cart__table tbody").innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding: 40px 0; color: rgba(255,255,255,0.6);">
          Your cart is empty.
        </td>
      </tr>`;
      subtotalEl.textContent = "$0.00";
      totalEl.textContent = `$${shippingCost.toFixed(2)}`;
    }
  }
});
