/* ========================================
 * ENHANCED MENU DATA WITH DIETARY INFO
 * ======================================== */

// Enhanced menu items with dietary badges and allergen information
export const enhancedMenuItems = [
  {
    id: 1,
    title: "Pancake Stack",
    desc: "Fluffy pancakes with maple syrup and butter.",
    price: 5.99,
    image: "../assets/images/home-page/menu-section/noodles.png",
    category: "breakfast",
    // Dietary badges
    badges: ["popular", "vegetarian"],
    // Allergen information
    allergens: ["gluten", "dairy", "eggs"],
    // Pairing suggestions
    pairsWith: [2, 3, 5],
    spiceLevel: 0,
  },
  {
    id: 2,
    title: "Avocado Toast",
    desc: "Wholegrain toast with avocado and poached eggs.",
    price: 7.5,
    image: "../assets/images/home-page/menu-section/new-lubina.png",
    category: "breakfast",
    badges: ["vegan", "chef-special"],
    allergens: ["gluten"],
    pairsWith: [1, 4],
    spiceLevel: 0,
  },
  {
    id: 3,
    title: "Grilled Chicken Bowl",
    desc: "Healthy rice bowl with grilled chicken and veggies.",
    price: 9.99,
    image: "../assets/images/home-page/menu-section/chicken.png",
    category: "lunch",
    badges: ["gluten-free", "popular"],
    allergens: [],
    pairsWith: [1, 6],
    spiceLevel: 1,
  },
  {
    id: 4,
    title: "Spicy Ramen",
    desc: "Traditional ramen with spicy broth and fresh vegetables.",
    price: 8.99,
    image: "../assets/images/home-page/menu-section/noodles.png",
    category: "lunch",
    badges: ["spicy", "popular"],
    allergens: ["gluten", "soy"],
    pairsWith: [2, 5],
    spiceLevel: 3,
  },
  {
    id: 5,
    title: "Vegan Buddha Bowl",
    desc: "Colorful mix of quinoa, roasted vegetables, and tahini.",
    price: 10.5,
    image: "../assets/images/home-page/menu-section/new-lubina.png",
    category: "lunch",
    badges: ["vegan", "gluten-free"],
    allergens: ["sesame"],
    pairsWith: [1, 3],
    spiceLevel: 0,
  },
  {
    id: 6,
    title: "Steak & Fries",
    desc: "Juicy grilled steak served with crispy french fries.",
    price: 15.99,
    image: "../assets/images/home-page/menu-section/chicken.png",
    category: "dinner",
    badges: ["chef-special", "gluten-free"],
    allergens: [],
    pairsWith: [3, 7],
    spiceLevel: 0,
  },
  {
    id: 7,
    title: "Salmon Teriyaki",
    desc: "Fresh salmon glazed with teriyaki sauce and steamed rice.",
    price: 14.5,
    image: "../assets/images/home-page/menu-section/new-lubina.png",
    category: "dinner",
    badges: ["gluten-free", "popular"],
    allergens: ["fish", "soy"],
    pairsWith: [5, 6],
    spiceLevel: 0,
  },
  {
    id: 8,
    title: "Margherita Pizza",
    desc: "Classic Italian pizza with fresh mozzarella and basil.",
    price: 12.99,
    image: "../assets/images/home-page/menu-section/chicken.png",
    category: "dinner",
    badges: ["vegetarian", "popular"],
    allergens: ["gluten", "dairy"],
    pairsWith: [2, 4],
    spiceLevel: 0,
  },
  {
    id: 9,
    title: "Buffalo Wings",
    desc: "Crispy chicken wings tossed in spicy buffalo sauce.",
    price: 7.99,
    image: "../assets/images/home-page/menu-section/chicken.png",
    category: "starters",
    badges: ["spicy", "gluten-free"],
    allergens: ["dairy"],
    pairsWith: [3, 8],
    spiceLevel: 3,
  },
  {
    id: 10,
    title: "Spring Rolls",
    desc: "Fresh vegetables wrapped in rice paper with peanut sauce.",
    price: 6.5,
    image: "../assets/images/home-page/menu-section/noodles.png",
    category: "starters",
    badges: ["vegan", "popular"],
    allergens: ["peanuts", "soy"],
    pairsWith: [4, 5],
    spiceLevel: 1,
  },
];

/* ========================================
 * DIETARY BADGE CONFIGURATION
 * ======================================== */

export const dietaryBadges = {
  vegan: {
    label: "Vegan",
    icon: "🌱",
    color: "#10b981",
    description: "Contains no animal products",
  },
  vegetarian: {
    label: "Vegetarian",
    icon: "🥗",
    color: "#84cc16",
    description: "Contains no meat or fish",
  },
  "gluten-free": {
    label: "Gluten Free",
    icon: "🌾",
    color: "#f59e0b",
    description: "Contains no gluten",
  },
  spicy: {
    label: "Spicy",
    icon: "🌶️",
    color: "#ef4444",
    description: "Contains hot spices",
  },
  popular: {
    label: "Popular",
    icon: "🔥",
    color: "#fb8f2c",
    description: "Customer favorite",
  },
  "chef-special": {
    label: "Chef's Special",
    icon: "⭐",
    color: "#eab308",
    description: "Recommended by our chef",
  },
};

/* ========================================
 * ALLERGEN INFORMATION
 * ======================================== */

export const allergenInfo = {
  gluten: {
    name: "Gluten",
    icon: "⚠️",
    severity: "high",
  },
  dairy: {
    name: "Dairy",
    icon: "🥛",
    severity: "medium",
  },
  eggs: {
    name: "Eggs",
    icon: "🥚",
    severity: "medium",
  },
  nuts: {
    name: "Tree Nuts",
    icon: "🌰",
    severity: "high",
  },
  peanuts: {
    name: "Peanuts",
    icon: "🥜",
    severity: "high",
  },
  soy: {
    name: "Soy",
    icon: "⚠️",
    severity: "low",
  },
  fish: {
    name: "Fish",
    icon: "🐟",
    severity: "medium",
  },
  sesame: {
    name: "Sesame",
    icon: "⚠️",
    severity: "medium",
  },
};
