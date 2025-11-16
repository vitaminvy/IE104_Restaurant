// ================================
// DIETARY PREFERENCES MANAGER
// Save and apply user's dietary preferences for menu filtering
// ================================

/**
 * DietaryPreferencesManager - Manage user dietary restrictions and preferences
 * Features: Save preferences, auto-filter menu, preference badges
 */
class DietaryPreferencesManager {
  constructor() {
    this.storageKey = STORAGE_KEYS.DIETARY_PREFERENCES;
    this.preferences = this.loadPreferences();
    this.availablePreferences = [
      { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
      { id: 'vegan', label: 'Vegan', icon: '🌱' },
      { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
      { id: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
      { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
      { id: 'keto', label: 'Keto', icon: '🥑' },
      { id: 'paleo', label: 'Paleo', icon: '🥩' },
      { id: 'halal', label: 'Halal', icon: '☪️' },
      { id: 'kosher', label: 'Kosher', icon: '✡️' },
      { id: 'spicy', label: 'Spicy', icon: '🌶️' },
    ];
  }

  /**
   * Load preferences from localStorage
   * @returns {Object} Preferences object
   */
  loadPreferences() {
    return StorageManager.get(this.storageKey, {
      selected: [], // Array of selected preference IDs
      autoFilter: false, // Auto-filter menu based on preferences
    });
  }

  /**
   * Save preferences to localStorage
   * @returns {boolean} Success status
   */
  savePreferences() {
    const success = StorageManager.set(this.storageKey, this.preferences);

    if (success) {
      EventBus.emit('dietary:preferences_changed', {
        preferences: this.preferences,
      });
    }

    return success;
  }

  /**
   * Add dietary preference
   * @param {string} preferenceId - Preference ID
   * @returns {boolean} Success status
   */
  addPreference(preferenceId) {
    if (this.preferences.selected.includes(preferenceId)) {
      return false;
    }

    this.preferences.selected.push(preferenceId);
    this.savePreferences();

    const pref = this.availablePreferences.find((p) => p.id === preferenceId);
    if (pref && window.NotificationSystem) {
      window.NotificationSystem.success(`${pref.label} preference added`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Remove dietary preference
   * @param {string} preferenceId - Preference ID
   * @returns {boolean} Success status
   */
  removePreference(preferenceId) {
    const index = this.preferences.selected.indexOf(preferenceId);
    if (index === -1) return false;

    this.preferences.selected.splice(index, 1);
    this.savePreferences();

    const pref = this.availablePreferences.find((p) => p.id === preferenceId);
    if (pref && window.NotificationSystem) {
      window.NotificationSystem.info(`${pref.label} preference removed`, {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Toggle preference
   * @param {string} preferenceId - Preference ID
   * @returns {boolean} New selection status
   */
  togglePreference(preferenceId) {
    if (this.preferences.selected.includes(preferenceId)) {
      this.removePreference(preferenceId);
      return false;
    } else {
      this.addPreference(preferenceId);
      return true;
    }
  }

  /**
   * Set auto-filter mode
   * @param {boolean} enabled - Enable auto-filter
   * @returns {boolean} Success status
   */
  setAutoFilter(enabled) {
    this.preferences.autoFilter = enabled;
    this.savePreferences();

    if (window.NotificationSystem) {
      window.NotificationSystem.info(
        `Auto-filter ${enabled ? 'enabled' : 'disabled'}`,
        { duration: TIMINGS.NOTIFICATION_SHORT }
      );
    }

    return true;
  }

  /**
   * Get selected preferences
   * @returns {Array} Selected preference IDs
   */
  getSelected() {
    return [...this.preferences.selected];
  }

  /**
   * Check if auto-filter is enabled
   * @returns {boolean} Auto-filter status
   */
  isAutoFilterEnabled() {
    return this.preferences.autoFilter;
  }

  /**
   * Filter menu items based on preferences
   * @param {Array} items - Menu items to filter
   * @returns {Array} Filtered items
   */
  filterMenuItems(items) {
    if (
      !this.preferences.autoFilter ||
      this.preferences.selected.length === 0
    ) {
      return items;
    }

    return items.filter((item) => {
      // Item must have ALL selected dietary badges
      return this.preferences.selected.every((pref) =>
        item.badges?.includes(pref)
      );
    });
  }

  /**
   * Check if item matches preferences
   * @param {Object} item - Menu item
   * @returns {boolean} Matches preferences
   */
  itemMatchesPreferences(item) {
    if (this.preferences.selected.length === 0) return true;

    return this.preferences.selected.every((pref) =>
      item.badges?.includes(pref)
    );
  }

  /**
   * Get preference details
   * @param {string} preferenceId - Preference ID
   * @returns {Object|null} Preference details
   */
  getPreferenceDetails(preferenceId) {
    return (
      this.availablePreferences.find((p) => p.id === preferenceId) || null
    );
  }

  /**
   * Get all available preferences
   * @returns {Array} Available preferences
   */
  getAvailablePreferences() {
    return [...this.availablePreferences];
  }

  /**
   * Clear all preferences
   * @returns {boolean} Success status
   */
  clearAll() {
    this.preferences.selected = [];
    this.preferences.autoFilter = false;
    this.savePreferences();

    if (window.NotificationSystem) {
      window.NotificationSystem.info('All dietary preferences cleared', {
        duration: TIMINGS.NOTIFICATION_SHORT,
      });
    }

    return true;
  }

  /**
   * Create preferences modal/panel
   */
  createPreferencesModal() {
    const modalHTML = `
      <div class="dietary-preferences-modal-overlay" id="dietary-preferences-modal" style="display: none;">
        <div class="dietary-preferences-modal">
          <div class="dietary-preferences-modal__header">
            <h3>Dietary Preferences</h3>
            <button class="dietary-preferences-modal__close" id="close-dietary-modal">✕</button>
          </div>

          <div class="dietary-preferences-modal__body">
            <p class="dietary-preferences-description">
              Select your dietary preferences to filter menu items automatically.
            </p>

            <!-- Auto-filter Toggle -->
            <div class="dietary-auto-filter">
              <label class="dietary-toggle-label">
                <input
                  type="checkbox"
                  id="dietary-auto-filter-toggle"
                  ${this.preferences.autoFilter ? 'checked' : ''}
                />
                <span>Automatically filter menu based on my preferences</span>
              </label>
            </div>

            <!-- Preferences Grid -->
            <div class="dietary-preferences-grid">
              ${this.availablePreferences
                .map(
                  (pref) => `
                <label class="dietary-preference-item ${this.preferences.selected.includes(pref.id) ? 'selected' : ''}">
                  <input
                    type="checkbox"
                    class="dietary-preference-checkbox"
                    data-preference-id="${pref.id}"
                    ${this.preferences.selected.includes(pref.id) ? 'checked' : ''}
                  />
                  <div class="dietary-preference-content">
                    <span class="dietary-preference-icon">${pref.icon}</span>
                    <span class="dietary-preference-label">${pref.label}</span>
                  </div>
                </label>
              `
                )
                .join('')}
            </div>

            <!-- Action Buttons -->
            <div class="dietary-preferences-actions">
              <button class="btn-secondary" id="clear-dietary-preferences">
                Clear All
              </button>
              <button class="btn" id="save-dietary-preferences">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById('dietary-preferences-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Insert modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Attach event handlers
    this.attachModalEventHandlers();
  }

  /**
   * Attach modal event handlers
   */
  attachModalEventHandlers() {
    const modal = document.getElementById('dietary-preferences-modal');
    if (!modal) return;

    // Close button
    document.getElementById('close-dietary-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });

    // Auto-filter toggle
    document
      .getElementById('dietary-auto-filter-toggle')
      .addEventListener('change', (e) => {
        this.setAutoFilter(e.target.checked);
      });

    // Preference checkboxes
    modal.querySelectorAll('.dietary-preference-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const preferenceId = e.target.dataset.preferenceId;
        const label = e.target.closest('.dietary-preference-item');

        if (e.target.checked) {
          this.addPreference(preferenceId);
          label.classList.add('selected');
        } else {
          this.removePreference(preferenceId);
          label.classList.remove('selected');
        }
      });
    });

    // Clear all button
    document
      .getElementById('clear-dietary-preferences')
      .addEventListener('click', () => {
        this.clearAll();
        modal.querySelectorAll('.dietary-preference-checkbox').forEach((cb) => {
          cb.checked = false;
        });
        modal.querySelectorAll('.dietary-preference-item').forEach((item) => {
          item.classList.remove('selected');
        });
        document.getElementById('dietary-auto-filter-toggle').checked = false;
      });

    // Save button
    document
      .getElementById('save-dietary-preferences')
      .addEventListener('click', () => {
        modal.style.display = 'none';

        if (window.NotificationSystem) {
          window.NotificationSystem.success('Dietary preferences saved!', {
            duration: TIMINGS.NOTIFICATION_MEDIUM,
          });
        }

        // Trigger menu re-render if on menu page
        EventBus.emit('dietary:preferences_saved', {
          preferences: this.preferences,
        });
      });
  }

  /**
   * Show preferences modal
   */
  showModal() {
    this.createPreferencesModal();
    const modal = document.getElementById('dietary-preferences-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
}

// Initialize
window.DietaryPreferencesManager = new DietaryPreferencesManager();

console.log('✅ Dietary Preferences Manager initialized');
