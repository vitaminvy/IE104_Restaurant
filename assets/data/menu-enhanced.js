/* ========================================
 * ENHANCED MENU DATA WITH ALLERGEN INFO
 * Re-export from mockdata.js with allergen definitions
 * ======================================== */

// Import menu items from mockdata
export { menuItems as enhancedMenuItems, dietaryBadges } from './mockdata.js';

/* ========================================
 * ALLERGEN INFORMATION DATABASE
 * ======================================== */

export const allergenInfo = {
  gluten: {
    name: "Gluten",
    icon: "🌾",
    description: "Contains wheat, barley, rye, or related grains",
    severity: "high",
    color: "#f59e0b"
  },
  dairy: {
    name: "Dairy",
    icon: "🥛",
    description: "Contains milk, cheese, butter, or dairy products",
    severity: "high",
    color: "#3b82f6"
  },
  eggs: {
    name: "Eggs",
    icon: "🥚",
    description: "Contains eggs or egg-derived ingredients",
    severity: "high",
    color: "#fbbf24"
  },
  nuts: {
    name: "Tree Nuts",
    icon: "🌰",
    description: "Contains tree nuts (almonds, walnuts, etc.)",
    severity: "high",
    color: "#92400e"
  },
  peanuts: {
    name: "Peanuts",
    icon: "🥜",
    description: "Contains peanuts or peanut-derived ingredients",
    severity: "high",
    color: "#d97706"
  },
  soy: {
    name: "Soy",
    icon: "🫘",
    description: "Contains soybeans or soy-derived products",
    severity: "medium",
    color: "#65a30d"
  },
  fish: {
    name: "Fish",
    icon: "🐟",
    description: "Contains fish or fish-derived ingredients",
    severity: "high",
    color: "#0ea5e9"
  },
  shellfish: {
    name: "Shellfish",
    icon: "🦐",
    description: "Contains shellfish (shrimp, crab, lobster, etc.)",
    severity: "high",
    color: "#e11d48"
  },
  sesame: {
    name: "Sesame",
    icon: "🫙",
    description: "Contains sesame seeds or sesame oil",
    severity: "medium",
    color: "#78350f"
  },
  sulfites: {
    name: "Sulfites",
    icon: "⚗️",
    description: "Contains sulfur dioxide or sulfites",
    severity: "medium",
    color: "#6b7280"
  },
  celery: {
    name: "Celery",
    icon: "🥬",
    description: "Contains celery or celeriac",
    severity: "low",
    color: "#84cc16"
  },
  mustard: {
    name: "Mustard",
    icon: "🌻",
    description: "Contains mustard seeds or mustard products",
    severity: "low",
    color: "#eab308"
  },
  lupin: {
    name: "Lupin",
    icon: "🫘",
    description: "Contains lupin flour or lupin beans",
    severity: "medium",
    color: "#a78bfa"
  },
  molluscs: {
    name: "Molluscs",
    icon: "🐚",
    description: "Contains molluscs (clams, mussels, oysters, etc.)",
    severity: "high",
    color: "#fb923c"
  }
};

/* ========================================
 * HELPER FUNCTIONS
 * ======================================== */

/**
 * Get allergen info by key
 * @param {string} allergenKey - The allergen identifier
 * @returns {object|null} Allergen information or null
 */
export function getAllergenInfo(allergenKey) {
  return allergenInfo[allergenKey] || null;
}

/**
 * Get all allergens for a menu item
 * @param {number} itemId - The menu item ID
 * @returns {array} Array of allergen objects
 */
export function getItemAllergens(itemId) {
  const item = enhancedMenuItems.find(i => i.id === itemId);
  if (!item || !item.allergens) return [];
  
  return item.allergens
    .map(key => allergenInfo[key])
    .filter(Boolean);
}

/**
 * Check if item contains specific allergens
 * @param {number} itemId - The menu item ID
 * @param {array} allergenKeys - Array of allergen keys to check
 * @returns {boolean} True if item contains any of the allergens
 */
export function itemHasAllergens(itemId, allergenKeys) {
  const item = enhancedMenuItems.find(i => i.id === itemId);
  if (!item || !item.allergens) return false;
  
  return allergenKeys.some(key => item.allergens.includes(key));
}

/**
 * Get items safe for user allergens
 * @param {array} userAllergens - Array of user's allergen keys
 * @returns {array} Array of safe menu items
 */
export function getSafeItems(userAllergens) {
  if (!userAllergens || userAllergens.length === 0) {
    return enhancedMenuItems;
  }
  
  return enhancedMenuItems.filter(item => {
    if (!item.allergens) return true;
    return !item.allergens.some(allergen => userAllergens.includes(allergen));
  });
}

/**
 * Get items that contain specific allergens
 * @param {array} allergenKeys - Array of allergen keys
 * @returns {array} Array of menu items containing those allergens
 */
export function getItemsWithAllergens(allergenKeys) {
  return enhancedMenuItems.filter(item => {
    if (!item.allergens) return false;
    return allergenKeys.some(key => item.allergens.includes(key));
  });
}
