/* ========================================
 * ALLERGY ALERT SYSTEM FUNCTIONALITY
 * ======================================== */

import { allergenInfo } from "../data/menu-enhanced.js";

/* ========================================
 * ALLERGY ALERT COMPONENT
 * ======================================== */

(function () {
  // STORAGE KEY
  const STORAGE_KEY = "userAllergens";

  // STATE
  let userAllergens = loadUserAllergens();

  /* ========================================
   * LOAD USER ALLERGENS FROM LOCALSTORAGE
   * ======================================== */

  function loadUserAllergens() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading allergens:", error);
      return [];
    }
  }

  /* ========================================
   * SAVE USER ALLERGENS TO LOCALSTORAGE
   * ======================================== */

  function saveUserAllergens(allergens) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allergens));
      userAllergens = allergens;
    } catch (error) {
      console.error("Error saving allergens:", error);
    }
  }

  /* ========================================
   * CREATE ALLERGY SETTINGS TRIGGER BUTTON
   * ======================================== */

  function createAllergyTrigger() {
    const trigger = document.createElement("button");
    trigger.className = "allergy-settings-trigger";
    trigger.setAttribute("aria-label", "Manage allergy settings");

    const icon = document.createElement("span");
    icon.className = "allergy-settings-trigger__icon";
    icon.textContent = "⚠️";

    const text = document.createElement("span");
    text.textContent = "Allergy Settings";

    trigger.appendChild(icon);
    trigger.appendChild(text);

    // Click handler
    trigger.addEventListener("click", openAllergyModal);

    document.body.appendChild(trigger);
  }

  /* ========================================
   * CREATE ALLERGY MODAL
   * ======================================== */

  function createAllergyModal() {
    // Overlay
    const overlay = document.createElement("div");
    overlay.className = "allergy-modal-overlay";
    overlay.id = "allergyModalOverlay";

    // Modal container
    const modal = document.createElement("div");
    modal.className = "allergy-modal";

    // Header
    const header = document.createElement("div");
    header.className = "allergy-modal__header";

    const title = document.createElement("h2");
    title.className = "allergy-modal__title";
    title.textContent = "Manage Allergies";

    const closeBtn = document.createElement("button");
    closeBtn.className = "allergy-modal__close";
    closeBtn.innerHTML = "×";
    closeBtn.setAttribute("aria-label", "Close modal");
    closeBtn.addEventListener("click", closeAllergyModal);

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Allergen grid
    const grid = document.createElement("div");
    grid.className = "allergy-modal__grid";

    Object.entries(allergenInfo).forEach(([key, allergen]) => {
      const checkbox = createAllergenCheckbox(key, allergen);
      grid.appendChild(checkbox);
    });

    // Footer
    const footer = document.createElement("div");
    footer.className = "allergy-modal__footer";

    const saveBtn = document.createElement("button");
    saveBtn.className = "allergy-modal__save-btn";
    saveBtn.textContent = "Save Settings";
    saveBtn.addEventListener("click", saveAllergySettings);

    const clearBtn = document.createElement("button");
    clearBtn.className = "allergy-modal__clear-btn";
    clearBtn.textContent = "Clear All";
    clearBtn.addEventListener("click", clearAllAllergens);

    footer.appendChild(clearBtn);
    footer.appendChild(saveBtn);

    // Assemble modal
    modal.appendChild(header);
    modal.appendChild(grid);
    modal.appendChild(footer);
    overlay.appendChild(modal);

    // Close on overlay click
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeAllergyModal();
      }
    });

    document.body.appendChild(overlay);
  }

  /* ========================================
   * CREATE ALLERGEN CHECKBOX
   * ======================================== */

  function createAllergenCheckbox(key, allergen) {
    const label = document.createElement("label");
    label.className = "allergen-checkbox";
    label.dataset.allergen = key;

    // Check if already selected
    if (userAllergens.includes(key)) {
      label.classList.add("allergen-checkbox--selected");
    }

    // Hidden input
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "allergen-checkbox__input";
    input.value = key;
    input.checked = userAllergens.includes(key);

    // Icon
    const icon = document.createElement("span");
    icon.className = "allergen-checkbox__icon";
    icon.textContent = allergen.icon;

    // Name
    const name = document.createElement("span");
    name.textContent = allergen.name;

    // Toggle handler
    label.addEventListener("click", () => {
      input.checked = !input.checked;
      label.classList.toggle("allergen-checkbox--selected");
    });

    label.appendChild(input);
    label.appendChild(icon);
    label.appendChild(name);

    return label;
  }

  /* ========================================
   * OPEN ALLERGY MODAL
   * ======================================== */

  function openAllergyModal() {
    const overlay = document.getElementById("allergyModalOverlay");
    if (overlay) {
      overlay.classList.add("allergy-modal-overlay--active");
      document.body.style.overflow = "hidden";
    }
  }

  /* ========================================
   * CLOSE ALLERGY MODAL
   * ======================================== */

  function closeAllergyModal() {
    const overlay = document.getElementById("allergyModalOverlay");
    if (overlay) {
      overlay.classList.remove("allergy-modal-overlay--active");
      document.body.style.overflow = "";
    }
  }

  /* ========================================
   * SAVE ALLERGY SETTINGS
   * ======================================== */

  function saveAllergySettings() {
    // Get all checked allergens
    const checkedInputs = document.querySelectorAll(
      ".allergen-checkbox__input:checked"
    );
    const selectedAllergens = Array.from(checkedInputs).map((input) => input.value);

    // Save to localStorage
    saveUserAllergens(selectedAllergens);

    // Show confirmation
    showToast(`✓ Allergy settings saved! ${selectedAllergens.length} allergen(s) tracked.`);

    // Close modal
    closeAllergyModal();

    // Re-check current page for warnings
    checkCurrentPageAllergens();
  }

  /* ========================================
   * CLEAR ALL ALLERGENS
   * ======================================== */

  function clearAllAllergens() {
    // Uncheck all
    const checkboxes = document.querySelectorAll(".allergen-checkbox");
    checkboxes.forEach((checkbox) => {
      const input = checkbox.querySelector("input");
      if (input) input.checked = false;
      checkbox.classList.remove("allergen-checkbox--selected");
    });

    // Clear from storage
    saveUserAllergens([]);

    showToast("✓ All allergens cleared.");
  }

  /* ========================================
   * CHECK CURRENT PAGE FOR ALLERGEN WARNINGS
   * ======================================== */

  function checkCurrentPageAllergens() {
    // If on product detail page
    const productDetailSection = document.querySelector("#product-detail");
    if (productDetailSection) {
      // Get product allergens (you would fetch this from your data)
      // For demo, we'll use example allergens
      const productAllergens = ["gluten", "dairy", "eggs"];

      displayProductAllergens(productAllergens);
      checkForAllergenConflict(productAllergens);
    }
  }

  /* ========================================
   * DISPLAY PRODUCT ALLERGENS
   * ======================================== */

  function displayProductAllergens(allergens) {
    const productInfo = document.querySelector(".product-detail__info");
    if (!productInfo) return;

    // Remove existing allergen display
    const existingDisplay = productInfo.querySelector(".product-allergens");
    if (existingDisplay) existingDisplay.remove();

    // Create allergen display
    const container = document.createElement("div");
    container.className = "product-allergens";

    const title = document.createElement("p");
    title.className = "product-allergens__title";
    title.textContent = "Contains:";

    const list = document.createElement("div");
    list.className = "product-allergens__list";

    allergens.forEach((allergenKey) => {
      const allergen = allergenInfo[allergenKey];
      if (!allergen) return;

      const badge = document.createElement("span");
      badge.className = "product-allergen-badge";

      // Highlight if user is allergic
      if (userAllergens.includes(allergenKey)) {
        badge.classList.add("product-allergen-badge--warning");
      }

      const icon = document.createElement("span");
      icon.className = "product-allergen-badge__icon";
      icon.textContent = allergen.icon;

      const name = document.createElement("span");
      name.textContent = allergen.name;

      badge.appendChild(icon);
      badge.appendChild(name);
      list.appendChild(badge);
    });

    container.appendChild(title);
    container.appendChild(list);

    // Insert after price
    const price = productInfo.querySelector(".product-detail__price");
    if (price) {
      price.insertAdjacentElement("afterend", container);
    } else {
      productInfo.appendChild(container);
    }
  }

  /* ========================================
   * CHECK FOR ALLERGEN CONFLICT
   * ======================================== */

  function checkForAllergenConflict(productAllergens) {
    // Find conflicts
    const conflicts = productAllergens.filter((allergen) =>
      userAllergens.includes(allergen)
    );

    if (conflicts.length > 0) {
      showAllergenWarning(conflicts);
    }
  }

  /* ========================================
   * SHOW ALLERGEN WARNING
   * ======================================== */

  function showAllergenWarning(conflicts) {
    const productInfo = document.querySelector(".product-detail__info");
    if (!productInfo) return;

    // Remove existing warning
    const existingWarning = productInfo.querySelector(".allergy-warning");
    if (existingWarning) existingWarning.remove();

    // Create warning
    const warning = document.createElement("div");
    warning.className = "allergy-warning";
    warning.setAttribute("role", "alert");

    const icon = document.createElement("span");
    icon.className = "allergy-warning__icon";
    icon.textContent = "⚠️";

    const text = document.createElement("div");
    text.className = "allergy-warning__text";

    const allergenNames = conflicts
      .map((key) => allergenInfo[key]?.name || key)
      .join(", ");

    text.innerHTML = `<strong>Allergy Warning:</strong> This item contains ${allergenNames}, which you marked as allergens.`;

    warning.appendChild(icon);
    warning.appendChild(text);

    // Insert at top of product info
    productInfo.insertBefore(warning, productInfo.firstChild);
  }

  /* ========================================
   * SHOW TOAST NOTIFICATION
   * ======================================== */

  function showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem 1.5rem;
      background: var(--color-dark-orange);
      color: white;
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideInUp 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ========================================
   * INITIALIZATION
   * ======================================== */

  function init() {
    // Create trigger button
    createAllergyTrigger();

    // Create modal
    createAllergyModal();

    // Check current page
    checkCurrentPageAllergens();
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
