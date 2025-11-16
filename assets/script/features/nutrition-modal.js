// ================================
// NUTRITION MODAL
// Display nutritional information for menu items
// ================================

/**
 * NutritionModal - Show nutrition facts in modal popup
 */
class NutritionModal {
  constructor() {
    this.createModal();
    this.attachEventHandlers();
  }

  /**
   * Create modal HTML structure
   */
  createModal() {
    const modalHTML = `
      <div class="nutrition-modal-overlay" id="nutrition-modal" style="display: none;">
        <div class="nutrition-modal">
          <div class="nutrition-modal__header">
            <h3 class="nutrition-modal__title">Nutrition Facts</h3>
            <button class="nutrition-modal__close" id="close-nutrition-modal" aria-label="Close">
              ✕
            </button>
          </div>

          <div class="nutrition-modal__body" id="nutrition-modal-body">
            <!-- Content will be dynamically inserted -->
          </div>
        </div>
      </div>
    `;

    // Insert modal into DOM
    if (!document.getElementById('nutrition-modal')) {
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    this.modal = document.getElementById('nutrition-modal');
    this.modalBody = document.getElementById('nutrition-modal-body');
  }

  /**
   * Attach event handlers
   */
  attachEventHandlers() {
    // Close button
    const closeBtn = document.getElementById('close-nutrition-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Click outside to close
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display !== 'none') {
        this.close();
      }
    });

    // Delegate click events for nutrition buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.nutrition-info-btn');
      if (btn) {
        e.preventDefault();
        const itemId = parseInt(btn.dataset.itemId);
        this.show(itemId);
      }
    });
  }

  /**
   * Show modal with nutrition data for specific item
   * @param {number} itemId - Menu item ID
   */
  show(itemId) {
    // Get item data
    const item = this.getItemData(itemId);
    if (!item) {
      console.error('Item not found:', itemId);
      return;
    }

    // Render nutrition facts
    this.renderNutritionFacts(item);

    // Show modal with animation
    this.modal.style.display = 'flex';
    setTimeout(() => {
      this.modal.classList.add('nutrition-modal--visible');
    }, 10);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close modal
   */
  close() {
    this.modal.classList.remove('nutrition-modal--visible');
    setTimeout(() => {
      this.modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  /**
   * Get item data from global menuData
   * @param {number} itemId - Item ID
   * @returns {Object|null} Item data
   */
  getItemData(itemId) {
    if (window.menuData) {
      return window.menuData.find((item) => item.id === itemId);
    }
    return null;
  }

  /**
   * Render nutrition facts table
   * @param {Object} item - Menu item with nutrition data
   */
  renderNutritionFacts(item) {
    // Default nutrition values if not provided
    const nutrition = item.nutrition || this.getDefaultNutrition(item);

    const allergensList = item.allergens
      ? item.allergens.map((a) => `<span class="allergen-badge">${a}</span>`).join('')
      : '<span class="no-allergens">None</span>';

    this.modalBody.innerHTML = `
      <div class="nutrition-facts">
        <!-- Item Header -->
        <div class="nutrition-item-header">
          <img src="${item.image}" alt="${item.title}" class="nutrition-item-image" />
          <div>
            <h4 class="nutrition-item-title">${item.title}</h4>
            <p class="nutrition-item-category">${item.category}</p>
          </div>
        </div>

        <!-- Serving Size -->
        <div class="nutrition-section">
          <div class="nutrition-row nutrition-serving">
            <strong>Serving Size:</strong> ${nutrition.servingSize || '1 portion'}
          </div>
        </div>

        <hr class="nutrition-divider" />

        <!-- Calories -->
        <div class="nutrition-section">
          <div class="nutrition-row nutrition-calories">
            <strong>Calories</strong>
            <strong>${nutrition.calories || 'N/A'}</strong>
          </div>
        </div>

        <hr class="nutrition-divider thick" />

        <!-- Daily Value Header -->
        <div class="nutrition-daily-value-header">
          <strong>% Daily Value*</strong>
        </div>

        <!-- Macronutrients -->
        <div class="nutrition-section">
          <div class="nutrition-row">
            <span><strong>Total Fat</strong> ${nutrition.fat || '0g'}</span>
            <strong>${this.calculateDailyValue(nutrition.fat, 78)}%</strong>
          </div>
          <div class="nutrition-row nutrition-indent">
            <span>Saturated Fat ${nutrition.saturatedFat || '0g'}</span>
            <span>${this.calculateDailyValue(nutrition.saturatedFat, 20)}%</span>
          </div>
          <div class="nutrition-row nutrition-indent">
            <span>Trans Fat ${nutrition.transFat || '0g'}</span>
            <span></span>
          </div>

          <div class="nutrition-row">
            <span><strong>Cholesterol</strong> ${nutrition.cholesterol || '0mg'}</span>
            <strong>${this.calculateDailyValue(nutrition.cholesterol, 300)}%</strong>
          </div>

          <div class="nutrition-row">
            <span><strong>Sodium</strong> ${nutrition.sodium || '0mg'}</span>
            <strong>${this.calculateDailyValue(nutrition.sodium, 2300)}%</strong>
          </div>

          <div class="nutrition-row">
            <span><strong>Total Carbohydrate</strong> ${nutrition.carbs || '0g'}</span>
            <strong>${this.calculateDailyValue(nutrition.carbs, 275)}%</strong>
          </div>
          <div class="nutrition-row nutrition-indent">
            <span>Dietary Fiber ${nutrition.fiber || '0g'}</span>
            <span>${this.calculateDailyValue(nutrition.fiber, 28)}%</span>
          </div>
          <div class="nutrition-row nutrition-indent">
            <span>Total Sugars ${nutrition.sugars || '0g'}</span>
            <span></span>
          </div>

          <div class="nutrition-row">
            <span><strong>Protein</strong> ${nutrition.protein || '0g'}</span>
            <strong>${this.calculateDailyValue(nutrition.protein, 50)}%</strong>
          </div>
        </div>

        <hr class="nutrition-divider thick" />

        <!-- Vitamins & Minerals -->
        <div class="nutrition-section nutrition-vitamins">
          <div class="nutrition-row">
            <span>Vitamin D ${nutrition.vitaminD || '0mcg'}</span>
            <span>${this.calculateDailyValue(nutrition.vitaminD, 20)}%</span>
          </div>
          <div class="nutrition-row">
            <span>Calcium ${nutrition.calcium || '0mg'}</span>
            <span>${this.calculateDailyValue(nutrition.calcium, 1300)}%</span>
          </div>
          <div class="nutrition-row">
            <span>Iron ${nutrition.iron || '0mg'}</span>
            <span>${this.calculateDailyValue(nutrition.iron, 18)}%</span>
          </div>
          <div class="nutrition-row">
            <span>Potassium ${nutrition.potassium || '0mg'}</span>
            <span>${this.calculateDailyValue(nutrition.potassium, 4700)}%</span>
          </div>
        </div>

        <hr class="nutrition-divider" />

        <!-- Allergens -->
        <div class="nutrition-section">
          <h5 class="nutrition-subsection-title">Allergens</h5>
          <div class="allergens-list">
            ${allergensList}
          </div>
        </div>

        <!-- Daily Value Footnote -->
        <div class="nutrition-footnote">
          <p>* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
        </div>
      </div>
    `;
  }

  /**
   * Calculate daily value percentage
   * @param {string} value - Nutrient value (e.g., "10g")
   * @param {number} dailyValue - Recommended daily value
   * @returns {number} Percentage
   */
  calculateDailyValue(value, dailyValue) {
    if (!value || value === '0g' || value === '0mg') return 0;

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return 0;

    return Math.round((numericValue / dailyValue) * 100);
  }

  /**
   * Get default nutrition data based on item category
   * @param {Object} item - Menu item
   * @returns {Object} Default nutrition values
   */
  getDefaultNutrition(item) {
    // Estimate based on category and price
    const baseCalories = {
      breakfast: 400,
      lunch: 600,
      dinner: 700,
      starters: 300,
    };

    const calories = baseCalories[item.category] || 500;

    return {
      servingSize: '1 portion',
      calories: calories,
      fat: Math.round(calories * 0.3 / 9) + 'g',
      saturatedFat: Math.round(calories * 0.1 / 9) + 'g',
      transFat: '0g',
      cholesterol: Math.round(calories * 0.05) + 'mg',
      sodium: Math.round(calories * 2) + 'mg',
      carbs: Math.round(calories * 0.5 / 4) + 'g',
      fiber: Math.round(calories * 0.03 / 4) + 'g',
      sugars: Math.round(calories * 0.1 / 4) + 'g',
      protein: Math.round(calories * 0.2 / 4) + 'g',
      vitaminD: '0mcg',
      calcium: '50mg',
      iron: '2mg',
      potassium: '200mg',
    };
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.NutritionModal = new NutritionModal();
  });
} else {
  window.NutritionModal = new NutritionModal();
}
