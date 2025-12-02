import i18nService from "../../assets/script/i18n-service.js";

(async function () {
  "use strict";

  await i18nService.init();
  document.dispatchEvent(new CustomEvent("language-changed"));

  /* ========================================
   * CONFIGURATION & CONSTANTS
   * ======================================== */

  const CART_STORAGE_KEY = "restaurantCart";
  const COUPON_STORAGE_KEY = "restaurant_applied_coupon";
  const SHIPPING_COST = 6.0; // Flat rate shipping
  const HISTORY_STORAGE_KEY = "activityHistory";
  const HISTORY_LIMIT = 50;

  /* ========================================
   * CART STATE MANAGEMENT
   * ======================================== */

  function getCartItems() {
    try {
      const items = localStorage.getItem(CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      // console.error('Error loading cart:', error);
      return [];
    }
  }

  function getAppliedCoupon() {
    try {
      const coupon = localStorage.getItem(COUPON_STORAGE_KEY);
      return coupon ? JSON.parse(coupon) : null;
    } catch (error) {
      // console.error('Error loading coupon:', error);
      return null;
    }
  }

  /* ========================================
   * CART CALCULATIONS
   * ======================================== */

  function calculateSubtotal(items) {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  }

  function calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = subtotal * (coupon.discount / 100);
    } else if (coupon.type === "fixed") {
      discount = Math.min(coupon.discount, subtotal);
    }
    return discount;
  }

  function calculateTotal(subtotal, discount, shipping) {
    return Math.max(0, subtotal - discount + shipping);
  }

  /* ========================================
   * ORDER HISTORY (for Activity page)
   * ======================================== */

  function getHistoryItems() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function saveHistoryItems(items) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      // noop
    }
  }

  function appendOrderHistory(entry) {
    const existing = getHistoryItems();
    existing.unshift(entry);
    const trimmed = existing.slice(0, HISTORY_LIMIT);
    saveHistoryItems(trimmed);
  }

  function formatAddress(formData) {
    const parts = [
      formData.street2,
      formData.district,
      formData.city,
      formData.country,
    ]
      .map((part) => (part || "").trim())
      .filter(Boolean);
    return parts.join(", ");
  }

  /* ========================================
   * DOM MANIPULATION
   * ======================================== */

  function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
  }

  function renderOrderItems(items) {
    const tbody = document.querySelector(".order-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    items.forEach((item) => {
      const tr = document.createElement("tr");
      const itemTotal =
        (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);

      tr.innerHTML = `
        <td>${i18nService.t(item.title)} × ${item.quantity}</td>
        <td>${formatCurrency(itemTotal)}</td>
      `;

      tbody.appendChild(tr);
    });
  }

  function updateOrderTotals(subtotal, discount, coupon, shipping, total) {
    const tfoot = document.querySelector(".order-table tfoot");
    if (!tfoot) return;

    let shippingText = i18nService.t(
      "checkout_page.order_summary.shipping_rate"
    );

    if (coupon && coupon.type === "freeship") {
      shippingText = `<span style="text-decoration: line-through; color: #999;">${i18nService.t(
        "checkout_page.order_summary.shipping_rate"
      )}</span> <span style="color: #4CAF50; font-weight: 600;">${i18nService.t(
        "checkout_page.notifications.free_shipping"
      )}</span>`;
      shipping = 0;
      total = subtotal - discount;
    }

    let footerHTML = `
      <tr>
        <th>${i18nService.t("checkout_page.order_summary.subtotal_footer")}</th>
        <td>${formatCurrency(subtotal)}</td>
      </tr>
    `;

    if (discount > 0) {
      footerHTML += `
        <tr class="discount-row">
          <th>${i18nService.t("cart_page.totals.discount")}</th>
          <td>-${formatCurrency(
            discount
          )}</td>
        </tr>
      `;
    }

    if (coupon && coupon.description) {
      footerHTML += `
        <tr class="coupon-row">
          <th>${i18nService.t(
            "checkout_page.notifications.coupon_applied"
          )}</th>
          <td>${coupon.code}: ${coupon.description}</td>
        </tr>
      `;
    }

    footerHTML += `
      <tr>
        <th>${i18nService.t("checkout_page.order_summary.shipping")}</th>
        <td>${shippingText}</td>
      </tr>
      <tr class="order-table__total">
        <th>${i18nService.t("checkout_page.order_summary.total")}</th>
        <td>${formatCurrency(total)}</td>
      </tr>
    `;

    tfoot.innerHTML = footerHTML;
  }

  function handleEmptyCart() {
    if (window.NotificationSystem) {
      window.NotificationSystem.info(
        i18nService.t("checkout_page.notifications.cart_empty_redirect")
      );
    }

    setTimeout(() => {
      window.location.href = "../cartpage/";
    }, 2000);
  }

  /* ========================================
   * FORM VALIDATION & ORDER PLACEMENT
   * ======================================== */

  function validateForm(form) {
    const requiredFields = form.querySelectorAll("[required]");
    let firstInvalidField = null;

    // Reset all borders first
    requiredFields.forEach((field) => (field.style.borderColor = ""));

    // 1. Check for empty required fields
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        field.style.borderColor = "#f44336";
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    }

    if (firstInvalidField) {
      if (window.NotificationSystem) {
        window.NotificationSystem.error(
          i18nService.t("checkout_page.notifications.fill_required_fields")
        );
      }
      firstInvalidField.focus();
      return false;
    }

    // 2. Check email format
    const emailField = form.querySelector("#email");
    if (emailField && emailField.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailField.value)) {
        emailField.style.borderColor = "#f44336";
        if (window.NotificationSystem) {
          window.NotificationSystem.error(
            i18nService.t("checkout_page.notifications.invalid_email")
          );
        }
        emailField.focus();
        return false;
      }
    }

    // 3. Check phone format
    const phoneField = form.querySelector("#phone");
    if (phoneField && phoneField.value) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(phoneField.value) || phoneField.value.length < 10) {
        phoneField.style.borderColor = "#f44336";
        if (window.NotificationSystem) {
          window.NotificationSystem.error(
            i18nService.t("checkout_page.notifications.invalid_phone")
          );
        }
        phoneField.focus();
        return false;
      }
    }

    // 4. Check payment method
    const paymentSelected = form.querySelector('input[name="payment"]:checked');
    if (!paymentSelected) {
      if (window.NotificationSystem) {
        window.NotificationSystem.error(
          i18nService.t("checkout_page.notifications.select_payment")
        );
      }
      // Optional: scroll to payment section
      form
        .querySelector(".payment")
        .scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }

    return true;
  }

  function handlePlaceOrder(e) {
    e.preventDefault();

    const form = e.target;

    if (!validateForm(form)) {
      return;
    }

    const items = getCartItems();
    if (items.length === 0) {
      handleEmptyCart();
      return;
    }

    const coupon = getAppliedCoupon();
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, coupon);
    let shipping = SHIPPING_COST;

    if (coupon && coupon.type === "freeship") {
      shipping = 0;
    }

    const total = calculateTotal(subtotal, discount, shipping);

    const formData = {
      firstName: form.querySelector("#firstName").value,
      lastName: form.querySelector("#lastName").value,
      country: form.querySelector("#country").value,
      street2: form.querySelector("#street2").value,
      city: form.querySelector("#city").value,
      district: form.querySelector("#district").value,
      zip: form.querySelector("#zip").value,
      phone: form.querySelector("#phone").value,
      email: form.querySelector("#email").value,
      paymentMethod: form.querySelector('input[name="payment"]:checked').value,
      items: items,
      subtotal: subtotal,
      discount: discount,
      shipping: shipping,
      total: total,
      coupon: coupon ? coupon.code : null,
      orderDate: new Date().toISOString(),
    };

    const orderId = Math.floor(Math.random() * 100000);
    const statusForHistory =
      formData.paymentMethod === "bank" ? "pending" : "confirmed";

    appendOrderHistory({
      id: `O${orderId}`,
      type: "order",
      status: statusForHistory,
      createdAt: formData.orderDate,
      items: items.map((item) => ({
        name: i18nService.t(item.title),
        titleKey: item.title,
        qty: item.quantity,
        price: item.price,
      })),
      subtotal,
      discount,
      shipping,
      total,
      currency: "USD",
      paymentMethod: formData.paymentMethod,
      coupon: formData.coupon,
      address: formatAddress(formData),
    });

    // Use the new combined message and upgraded i18nService
    const combinedMsg = i18nService.t(
      "checkout_page.notifications.order_placed_combined",
      { orderId: orderId }
    );

    if (window.NotificationSystem) {
      window.NotificationSystem.success(combinedMsg, { duration: 4000 });
    }

    setTimeout(() => {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
      window.location.href = "/activity-history/";
    }, 3000); // Redirect after 3 seconds
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function renderCheckoutSummary() {
    const items = getCartItems();
    if (items.length === 0) {
      return false;
    }

    const coupon = getAppliedCoupon();
    const subtotal = calculateSubtotal(items);
    const discount = calculateDiscount(subtotal, coupon);
    let shipping = SHIPPING_COST;

    if (coupon && coupon.type === "freeship") {
      shipping = 0;
    }

    const total = calculateTotal(subtotal, discount, shipping);

    renderOrderItems(items);
    updateOrderTotals(subtotal, discount, coupon, shipping, total);

    return true;
  }

  function initCheckout() {
    const hasItems = renderCheckoutSummary();
    if (!hasItems) {
      handleEmptyCart();
      return;
    }

    const form = document.querySelector(".form");
    if (form) {
      form.addEventListener("submit", handlePlaceOrder);
    }

    const requiredFields = document.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      field.addEventListener("blur", () => {
        if (field.value.trim()) {
          field.style.borderColor = "";
        }
      });
    });
    initQrCodeModal();
  }

  /* ========================================
   * QR CODE MODAL LOGIC
   * ======================================== */

  function initQrCodeModal() {
    const qrModal = document.getElementById("qr-code-modal");
    const closeModalButton = document.querySelector(".qr-modal__close");
    const paymentOptionsContainer = document.querySelector(".payment");

    if (!qrModal || !closeModalButton || !paymentOptionsContainer) {
      return;
    }

    const showQrModal = () => qrModal.classList.remove("hidden");
    const hideQrModal = () => qrModal.classList.add("hidden");

    paymentOptionsContainer.addEventListener("change", (event) => {
      const target = event.target;
      if (target.name === "payment") {
        if (target.id === "payment-bank" && target.checked) {
          showQrModal();
        } else {
          hideQrModal();
        }
      }
    });

    closeModalButton.addEventListener("click", hideQrModal);

    // Hide modal if user clicks on the overlay (background)
    qrModal.addEventListener("click", (event) => {
      if (event.target === qrModal) {
        hideQrModal();
      }
    });
  }

  /* ========================================
   * AUTO-INITIALIZE ON DOM READY
   * ======================================== */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCheckout);
  } else {
    initCheckout();
  }

  document.addEventListener("language-changed", () => {
    renderCheckoutSummary();
  });
})();
