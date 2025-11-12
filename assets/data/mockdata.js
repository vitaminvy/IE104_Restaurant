/* ========================================
 * MENU ITEMS DATA WITH DIETARY INFORMATION
 * ======================================== */

export const menuItems = [
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
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [2, 11, 17],
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
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [1, 17, 12],
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
    spiceLevel: 1,
    // Meal pairing suggestions
    pairsWith: [10, 12, 14],
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
    spiceLevel: 3,
    // Meal pairing suggestions
    pairsWith: [10, 16, 3],
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
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [12, 14, 10],
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
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [7, 8, 15],
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
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [12, 10, 6],
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
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [9, 16, 15],
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
    spiceLevel: 3,
    // Meal pairing suggestions
    pairsWith: [8, 6, 16],
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
    spiceLevel: 1,
    // Meal pairing suggestions
    pairsWith: [4, 3, 7],
  },
  {
    id: 11,
    title: "French Toast",
    desc: "Golden brioche with berries and maple syrup.",
    price: 8.99,
    image: "../assets/images/home-page/menu-section/noodles.png",
    category: "breakfast",
    badges: ["vegetarian", "chef-special"],
    allergens: ["gluten", "dairy", "eggs"],
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [1, 13, 17],
  },
  {
    id: 12,
    title: "Quinoa Salad",
    desc: "Protein-packed quinoa with mixed greens and vinaigrette.",
    price: 9.5,
    image: "../assets/images/home-page/menu-section/new-lubina.png",
    category: "lunch",
    badges: ["vegan", "gluten-free"],
    allergens: [],
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [5, 14, 3],
  },
  {
    id: 13,
    title: "Cheese Omelette",
    desc: "Fluffy three-egg omelette with cheddar cheese.",
    price: 7.99,
    image: "../assets/images/home-page/menu-section/noodles.png",
    category: "breakfast",
    badges: ["vegetarian", "gluten-free"],
    allergens: ["eggs", "dairy"],
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [1, 2, 11],
  },
  {
    id: 14,
    title: "Veggie Wrap",
    desc: "Grilled vegetables with hummus in a whole wheat wrap.",
    price: 8.5,
    image: "../assets/images/home-page/menu-section/new-lubina.png",
    category: "lunch",
    badges: ["vegan"],
    allergens: ["gluten", "sesame"],
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [12, 5, 10],
  },
  {
    id: 15,
    title: "BBQ Ribs",
    desc: "Slow-cooked pork ribs with house BBQ sauce.",
    price: 17.99,
    image: "../assets/images/home-page/menu-section/chicken.png",
    category: "dinner",
    badges: ["chef-special", "gluten-free"],
    allergens: [],
    spiceLevel: 2,
    // Meal pairing suggestions
    pairsWith: [9, 16, 6],
  },
  {
    id: 16,
    title: "Nachos Supreme",
    desc: "Tortilla chips loaded with cheese, jalapeños, and salsa.",
    price: 9.99,
    image: "../assets/images/home-page/menu-section/noodles.png",
    category: "starters",
    badges: ["spicy", "vegetarian"],
    allergens: ["dairy", "gluten"],
    spiceLevel: 2,
    // Meal pairing suggestions
    pairsWith: [8, 9, 4],
  },
  {
    id: 17,
    title: "Smoothie Bowl",
    desc: "Acai smoothie topped with granola and fresh fruits.",
    price: 9.5,
    image: "../assets/images/home-page/menu-section/new-lubina.png",
    category: "breakfast",
    badges: ["vegan", "gluten-free"],
    allergens: [],
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [2, 1, 11],
  },
  {
    id: 18,
    title: "Fish & Chips",
    desc: "Beer-battered cod with crispy chips and tartar sauce.",
    price: 13.99,
    image: "../assets/images/home-page/menu-section/chicken.png",
    category: "dinner",
    badges: ["popular"],
    allergens: ["fish", "gluten"],
    spiceLevel: 0,
    // Meal pairing suggestions
    pairsWith: [7, 10, 15],
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
