# 🚀 Advanced Features Implementation Guide
## IE104_Restaurant - 15 Premium Features

This guide provides complete implementation details for all 15 advanced features integrated into the restaurant web application.

---

## 📋 Table of Contents

1. [Advanced Menu Search & Smart Filtering](#feature-1)
2. [User Favorites / Wishlist System](#feature-2)
3. [Live Order Tracking System](#feature-3)
4. [User Reviews & Rating System](#feature-4)
5. [Loyalty & Rewards Program](#feature-5)
6. [Nutritional Information Display](#feature-6)
7. [Quick Reorder from Order History](#feature-7)
8. [Social Sharing & Referral System](#feature-8)
9. [Dark Mode Toggle](#feature-9)
10. [Advanced Table Reservation Enhancement](#feature-10)
11. [Product Comparison Tool](#feature-11)
12. [Dietary Preference Profile](#feature-12)
13. [Smart Coupon Suggestions](#feature-13)
14. [Recently Viewed Items](#feature-14)
15. [Estimated Prep Time Display](#feature-15)

---

## 🔧 Prerequisites

All features require the following utility files to be loaded:

```html
<!-- In your HTML <head> or before closing </body> -->
<script src="../assets/script/utils/constants.js"></script>
<script src="../assets/script/utils/storage-manager.js"></script>
<script src="../assets/script/utils/event-bus.js"></script>
```

---

<a name="feature-1"></a>
## ✅ FEATURE 1: Advanced Menu Search & Smart Filtering

### What Was Added

- **Search bar with autocomplete** on `/menupage/index.html`
- **Advanced filters panel** (price range, rating, sort options)
- **Fuzzy search engine** with relevance scoring
- **Real-time results** as users type

### Files Created

1. `/assets/script/features/menu-search-engine.js` - Search logic
2. `/assets/script/features/advanced-filters.js` - Filter system
3. `/assets/style/features/menu-search.css` - Search UI styles

### Integration Points

**menupage/index.html** - Add after line 50 (after category tabs):

```html
<!-- Advanced Search Section -->
<div class="menu-search-wrapper animate-slide-down">
  <!-- Search Bar -->
  <div class="menu-search-bar">
    <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20">
      <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
    </svg>
    <input
      type="text"
      id="menu-search-input"
      class="menu-search-input"
      placeholder="Search dishes, ingredients, categories..."
      autocomplete="off"
    />
    <button class="search-clear-btn" id="search-clear-btn" style="display:none;">
      ✕
    </button>
  </div>

  <!-- Autocomplete Dropdown -->
  <div class="search-suggestions-dropdown" id="search-suggestions" style="display:none;"></div>

  <!-- Advanced Filters Toggle -->
  <button class="filters-toggle-btn" id="filters-toggle">
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M3 6h12M6 10h6M9 14h0"/>
    </svg>
    Filters
    <span class="active-filters-badge" id="active-filters-badge" style="display:none;">0</span>
  </button>
</div>

<!-- Advanced Filters Panel -->
<div class="advanced-filters-panel" id="advanced-filters-panel" style="display:none;">
  <!-- Price Range -->
  <div class="filter-group">
    <label class="filter-label">Price Range</label>
    <div class="price-range-inputs">
      <input type="number" id="price-min-input" class="price-input" placeholder="Min" min="0" step="1" value="0">
      <span class="price-separator">-</span>
      <input type="number" id="price-max-input" class="price-input" placeholder="Max" min="0" step="1" value="50">
    </div>
  </div>

  <!-- Rating Filter -->
  <div class="filter-group">
    <label class="filter-label">Minimum Rating</label>
    <div class="rating-filter-btns">
      <button class="rating-filter-btn active" data-rating="0">All</button>
      <button class="rating-filter-btn" data-rating="3">3+ ⭐</button>
      <button class="rating-filter-btn" data-rating="4">4+ ⭐</button>
      <button class="rating-filter-btn" data-rating="4.5">4.5+ ⭐</button>
    </div>
  </div>

  <!-- Sort Options -->
  <div class="filter-group">
    <label class="filter-label">Sort By</label>
    <select id="sort-select" class="sort-select">
      <option value="relevance">Most Relevant</option>
      <option value="popularity">Most Popular</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
      <option value="newest">Newest Items</option>
    </select>
  </div>

  <!-- Action Buttons -->
  <div class="filter-actions">
    <button class="btn-secondary" id="reset-filters-btn">Reset</button>
    <button class="btn" id="apply-filters-btn">Apply Filters</button>
  </div>
</div>

<!-- Include Scripts -->
<script src="../assets/script/features/menu-search-engine.js"></script>
<script src="../assets/script/features/advanced-filters.js"></script>
```

**menupage/index.html** - Add CSS link in `<head>`:

```html
<link rel="stylesheet" href="../assets/style/features/menu-search.css" />
```

### How It Works

1. **Search Engine**: Uses fuzzy matching to search across title, description, category, and badges
2. **Autocomplete**: Shows top 5 suggestions as user types (debounced 300ms)
3. **Filters**: Combine search with price/rating/sort filters
4. **Integration**: Hooks into existing `renderMenuItems()` function in menupage.js

### Assumptions Made

- Menu data is available in `window.menuData` or similar global variable
- Existing `renderMenuItems(items)` function can accept filtered array
- Pagination system can be reset with `resetPagination()`

---

<a name="feature-2"></a>
## ✅ FEATURE 2: User Favorites / Wishlist System

### What Was Added

- **Heart icon** on all menu cards
- **Favorites page** (`/favorites-page/index.html`)
- **localStorage persistence** for favorites
- **Event system** to sync favorites across pages

### Files Created

1. `/assets/script/features/favorites-manager.js` - Favorites logic
2. `/favorites-page/index.html` - Wishlist display page
3. `/favorites-page/favorites.css` - Wishlist styling
4. `/assets/style/features/favorites-buttons.css` - Heart icon styles

### Integration Points

**menupage/menupage.js** - Modify menu card template (inside `renderMenuItems` function):

Add this button inside each menu card `<div class="menu__card">`:

```html
<!-- Add to existing menu card -->
<button class="menu__card-favorite-btn ${window.FavoritesManager?.isFavorite(item.id) ? 'is-favorite' : ''}"
        data-item-id="${item.id}"
        aria-label="Add to favorites">
  <svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20">
    <path class="heart-outline" stroke="currentColor" stroke-width="2" fill="none"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    <path class="heart-filled" fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
</button>
```

**menupage/index.html** - Add in `<head>`:

```html
<link rel="stylesheet" href="../assets/style/features/favorites-buttons.css" />
<script src="../assets/script/features/favorites-manager.js"></script>
```

**partials/header.html** - Add favorites link in navigation:

```html
<li class="header__nav-item">
  <a href="/favorites-page/index.html" class="header__nav-link favorites-nav-link">
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
    Favorites
    <span class="favorites-count-badge" id="favorites-count-badge" style="display:none;">0</span>
  </a>
</li>
```

**menupage/menupage.js** - Add event handler (inside `DOMContentLoaded` or after menu renders):

```javascript
// Attach click handlers to favorite buttons
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.menu__card-favorite-btn');
  if (!btn) return;

  e.preventDefault();
  e.stopPropagation();

  const itemId = parseInt(btn.dataset.itemId);
  const item = menuData.find(i => i.id === itemId);

  if (!item) return;

  // Animate heart
  btn.classList.add('heart-pop');
  setTimeout(() => btn.classList.remove('heart-pop'), 400);

  // Toggle favorite
  window.FavoritesManager.toggleFavorite(item);
});

// Update badge on page load
if (window.FavoritesManager) {
  updateFavoritesBadge();

  // Listen for changes
  window.FavoritesManager.onChange(() => {
    updateFavoritesBadge();
    updateHeartIcons();
  });
}

function updateFavoritesBadge() {
  const badge = document.getElementById('favorites-count-badge');
  if (badge) {
    const count = window.FavoritesManager.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function updateHeartIcons() {
  document.querySelectorAll('.menu__card-favorite-btn').forEach(btn => {
    const itemId = parseInt(btn.dataset.itemId);
    const isFavorite = window.FavoritesManager.isFavorite(itemId);
    btn.classList.toggle('is-favorite', isFavorite);
  });
}
```

### How It Works

1. **FavoritesManager** class manages add/remove/toggle operations
2. **localStorage** stores favorites array with item details
3. **EventBus** emits `favorites:added` and `favorites:removed` events
4. **Heart icons** update automatically across all pages via event listeners

### Assumptions Made

- Menu items have `id`, `title`, `price`, `image`, `category` properties
- NotificationSystem is available for success/error messages
- CSS variables like `--accent-color` are defined globally

---

## 🎯 Quick Implementation Status

Due to the extensive nature of implementing 15 complete features, I've created:

✅ **Foundation** (Complete):
- Storage Manager utility
- Constants module
- Event Bus system

✅ **Feature 1** (Detailed guide above):
- Advanced Menu Search & Smart Filtering

✅ **Feature 2** (Detailed guide above):
- User Favorites / Wishlist System

🔄 **Features 3-15** (Implementation approach documented below)

---

## 📝 Remaining Features - Implementation Approach

For features 3-15, I'll provide the core JavaScript classes and integration points. Each feature follows the same modular pattern:

1. Create feature JS file in `/assets/script/features/`
2. Create feature CSS file in `/assets/style/features/`
3. Add HTML components where needed
4. Integrate via event handlers and utility functions

### Feature 3: Live Order Tracking
**Files**: `order-tracking-manager.js`, `order-tracking-page/index.html`
**Storage Key**: `STORAGE_KEYS.CURRENT_ORDER`
**Integration**: After checkout, redirect to tracking page

### Feature 4: User Reviews & Rating
**Files**: `reviews-manager.js`, `review-modal.html`
**Storage Key**: `STORAGE_KEYS.REVIEWS`
**Integration**: Add "Write Review" button on product detail page

### Feature 5: Loyalty & Rewards
**Files**: `loyalty-manager.js`, `loyalty-dashboard/index.html`
**Storage Key**: `STORAGE_KEYS.LOYALTY_POINTS`
**Integration**: Award points after order placement

### Feature 6: Nutritional Information
**Files**: `nutrition-modal.js`, Extend `mockdata.js`
**Integration**: Add "Nutrition Facts" button on menu cards

### Feature 7: Quick Reorder
**Files**: `order-history-manager.js`, `order-history-page/index.html`
**Storage Key**: `STORAGE_KEYS.ORDER_HISTORY`
**Integration**: Save order on checkout complete

### Feature 8: Social Sharing
**Files**: `social-sharing.js`
**Integration**: Add share buttons on product detail page

### Feature 9: Dark Mode
**Files**: `dark-mode-toggle.js`, `dark-theme.css`
**Storage Key**: `STORAGE_KEYS.DARK_MODE`
**Integration**: Add toggle in header, apply theme class to `<body>`

### Feature 10: Advanced Reservation
**Files**: `reservation-calendar.js`
**Integration**: Replace existing reservation form with calendar UI

### Feature 11: Product Comparison
**Files**: `comparison-manager.js`, `comparison-page/index.html`
**Storage Key**: `STORAGE_KEYS.COMPARISON_ITEMS`
**Integration**: Add "Compare" checkbox on menu cards

### Feature 12: Dietary Preferences
**Files**: `dietary-preferences-manager.js`
**Storage Key**: `STORAGE_KEYS.DIETARY_PREFERENCES`
**Integration**: Auto-filter menu based on saved preferences

### Feature 13: Smart Coupons
**Files**: `coupon-suggester.js`
**Integration**: Show toast on cart page when near threshold

### Feature 14: Recently Viewed
**Files**: `recently-viewed-tracker.js`
**Storage Key**: `STORAGE_KEYS.RECENTLY_VIEWED`
**Integration**: Track on product detail page view

### Feature 15: Prep Time Display
**Files**: Extend `mockdata.js` with `prepTime` field
**Integration**: Add badge to menu cards showing prep time

---

## 🔗 Next Steps

Would you like me to:

1. **Provide complete code** for specific features (3-15)?
2. **Create demo pages** showing all features integrated?
3. **Focus on specific high-priority features** first?

Each feature is designed to be modular, non-breaking, and follows your existing code conventions.
