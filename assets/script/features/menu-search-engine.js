// ================================
// MENU SEARCH ENGINE
// Fuzzy search with autocomplete and relevance scoring
// ================================

/**
 * MenuSearchEngine - Advanced search functionality for menu items
 * Features: Fuzzy matching, autocomplete, relevance scoring
 */
class MenuSearchEngine {
  constructor(items) {
    this.items = items || [];
    this.searchIndex = this.buildSearchIndex();
  }

  /**
   * Build inverted index for fast searching
   * @returns {Map} Search index mapping terms to item indices
   */
  buildSearchIndex() {
    const index = new Map();

    this.items.forEach((item, idx) => {
      // Extract searchable terms
      const terms = [
        ...this.tokenize(item.title),
        ...this.tokenize(item.desc || ''),
        item.category?.toLowerCase(),
        ...(item.badges || []).map((b) => b.toLowerCase()),
      ].filter(Boolean);

      // Add to index
      terms.forEach((term) => {
        if (!index.has(term)) {
          index.set(term, []);
        }
        if (!index.get(term).includes(idx)) {
          index.get(term).push(idx);
        }
      });
    });

    return index;
  }

  /**
   * Tokenize text into searchable terms
   * @param {string} text - Text to tokenize
   * @returns {string[]} Array of terms
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 1);
  }

  /**
   * Search items with fuzzy matching
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Array} Filtered and sorted items
   */
  search(query, filters = {}) {
    const {
      priceMin = 0,
      priceMax = 999,
      minRating = 0,
      category = null,
      dietary = [],
    } = filters;

    // If no query, return all items matching filters
    if (!query || query.trim() === '') {
      return this.applyFilters(this.items, filters);
    }

    const queryTerms = this.tokenize(query);
    const scores = new Map();

    // Calculate relevance scores
    queryTerms.forEach((term) => {
      this.items.forEach((item, idx) => {
        let score = 0;

        // Exact title match (highest weight)
        if (item.title.toLowerCase() === term) {
          score += 20;
        }
        // Title contains term
        else if (item.title.toLowerCase().includes(term)) {
          score += 10;
        }

        // Description match
        if (item.desc && item.desc.toLowerCase().includes(term)) {
          score += 5;
        }

        // Category match
        if (item.category && item.category.toLowerCase().includes(term)) {
          score += 7;
        }

        // Badge match
        if (item.badges && item.badges.some((b) => b.toLowerCase().includes(term))) {
          score += 6;
        }

        if (score > 0) {
          scores.set(idx, (scores.get(idx) || 0) + score);
        }
      });
    });

    // Get items with scores
    let results = Array.from(scores.entries())
      .map(([idx, score]) => ({
        ...this.items[idx],
        _score: score,
      }))
      .filter((item) => {
        // Apply filters
        if (item.price < priceMin || item.price > priceMax) return false;
        if ((item.rating || 4) < minRating) return false;
        if (category && item.category !== category) return false;
        if (
          dietary.length > 0 &&
          !dietary.every((d) => item.badges && item.badges.includes(d))
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b._score - a._score);

    return results;
  }

  /**
   * Apply filters to items without search
   * @param {Array} items - Items to filter
   * @param {Object} filters - Filters to apply
   * @returns {Array} Filtered items
   */
  applyFilters(items, filters) {
    const { priceMin = 0, priceMax = 999, minRating = 0, category = null } = filters;

    return items.filter((item) => {
      if (item.price < priceMin || item.price > priceMax) return false;
      if ((item.rating || 4) < minRating) return false;
      if (category && item.category !== category) return false;
      return true;
    });
  }

  /**
   * Get autocomplete suggestions
   * @param {string} query - Search query
   * @param {number} limit - Max suggestions
   * @returns {Array} Top suggestions
   */
  getSuggestions(query, limit = 5) {
    if (!query || query.length < 2) return [];

    const results = this.search(query);
    return results.slice(0, limit);
  }

  /**
   * Sort results by specified criteria
   * @param {Array} items - Items to sort
   * @param {string} sortBy - Sort criterion
   * @returns {Array} Sorted items
   */
  sortResults(items, sortBy) {
    const sorted = [...items];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 4) - (a.rating || 4));
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'popularity':
        return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case 'relevance':
      default:
        return sorted; // Already sorted by relevance in search()
    }
  }
}

// Initialize search engine when menu data is available
window.initMenuSearch = function (menuData) {
  window.menuSearchEngine = new MenuSearchEngine(menuData);
  console.log('✅ Menu Search Engine initialized');
};

// Export
window.MenuSearchEngine = MenuSearchEngine;
