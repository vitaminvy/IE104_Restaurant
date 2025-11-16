/* ========================================
 * BLOG PAGE DYNAMIC LOADER
 * Timeline layout with filters + load more
 * ======================================== */

import {
  blogPosts,
  getFeaturedPost,
  getAllCategories,
  getAllTags,
} from '../../assets/data/blogdata.js';

const POSTS_PER_PAGE = 4;
let currentPage = 1;
let filteredPosts = [...blogPosts];
let selectedCategory = 'all';
let selectedTag = null;
let timelineObserver = null;

/* ========================================
 * FEATURED POST
 * ======================================== */
function renderFeaturedPost() {
  const featuredContainer = document.getElementById('featured-post');
  if (!featuredContainer) return;

  const post = getFeaturedPost();
  if (!post) {
    featuredContainer.style.display = 'none';
    return;
  }

  featuredContainer.innerHTML = `
    <div class="post-image">
      <img src="${post.image}" alt="${post.title}" loading="lazy">
    </div>
    <div class="post-content">
      <h2>${post.title}</h2>
      <p>${post.description}</p>
      <a href="../blogpage-details/index.html?id=${post.id}" class="read-more">Read more</a>
    </div>
  `;

  const featuredLink = featuredContainer.querySelector('.read-more');
  if (featuredLink) {
    featuredLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.GlobalLoader) {
        window.GlobalLoader.show('Loading article...');
      }
      setTimeout(() => {
        window.location.href = featuredLink.href;
      }, 200);
    });
  }
}

/* ========================================
 * FILTERS
 * ======================================== */
function setupFilters() {
  renderTagFilters();
  renderCategoryOptions();

  const categorySelect = document.getElementById('category-filter');
  const clearBtn = document.getElementById('clear-filters');

  if (categorySelect) {
    categorySelect.addEventListener('change', (event) => {
      selectedCategory = event.target.value;
      applyFilters();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      selectedCategory = 'all';
      selectedTag = null;
      syncFilterUI();
      applyFilters();
    });
  }
}

function renderTagFilters() {
  const container = document.getElementById('tag-filter');
  if (!container) return;

  container.innerHTML = '';
  const fragment = document.createDocumentFragment();

  getAllTags().forEach((tag) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'blog-filter-pill';
    pill.dataset.tag = tag;
    pill.textContent = tag;
    pill.addEventListener('click', () => {
      selectedTag = selectedTag === tag ? null : tag;
      syncFilterUI();
      applyFilters();
    });
    fragment.appendChild(pill);
  });

  container.appendChild(fragment);
}

function renderCategoryOptions() {
  const select = document.getElementById('category-filter');
  if (!select) return;

  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'All categories';
  select.appendChild(defaultOption);

  getAllCategories().forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function syncFilterUI() {
  const select = document.getElementById('category-filter');
  if (select) {
    select.value = selectedCategory;
  }

  document.querySelectorAll('.blog-filter-pill').forEach((pill) => {
    const tag = pill.dataset.tag;
    pill.classList.toggle('is-active', tag === selectedTag);
  });
}

function applyFilters() {
  filteredPosts = blogPosts.filter((post) => {
    const categoryMatch =
      selectedCategory === 'all' || post.category === selectedCategory;
    const tagMatch = !selectedTag || post.tags.includes(selectedTag);
    return categoryMatch && tagMatch;
  });

  currentPage = 1;
  renderBlogTimeline(1, false);
}

/* ========================================
 * TIMELINE RENDERING
 * ======================================== */
function initObserver() {
  timelineObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
}

function renderBlogTimeline(page = 1, append = false) {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const postsToRender = filteredPosts.slice(start, end);

  if (!append) {
    blogGrid.innerHTML = '';
  }

  if (postsToRender.length === 0 && page === 1) {
    blogGrid.innerHTML =
      '<p class="no-posts">No stories match your filters. Try another tag.</p>';
    updateLoadMoreState(false);
    return;
  }

  postsToRender.forEach((post) => {
    const readTime = post.readTime || 'Read time N/A';
    const excerpt = post.excerpt || post.description || '';

    const article = document.createElement('article');
    article.className = 'timeline-entry';

    article.innerHTML = `
      <div class="timeline-entry__marker">
        <span class="timeline-entry__dot" aria-hidden="true"></span>
        <span class="timeline-entry__date">${post.date}</span>
      </div>
      <div class="timeline-entry__card">
        <div>
          <div class="timeline-entry__meta">
            <span class="timeline-entry__category">${post.category}</span>
            <span>By ${post.author}</span>
            <span class="timeline-entry__readtime">${readTime}</span>
          </div>
          <h3 class="timeline-entry__heading">${post.title}</h3>
          <p class="timeline-entry__excerpt">${excerpt}</p>
          <div class="timeline-entry__tags">
            ${(post.tags || [])
              .map((tag) => `<span class="timeline-entry__tag">${tag}</span>`)
              .join('')}
          </div>
          <div class="timeline-entry__actions">
            <a href="../blogpage-details/index.html?id=${post.id}" class="read-more">Read article</a>
            <span class="timeline-entry__readtime">${readTime}</span>
          </div>
        </div>
        <div class="timeline-entry__image">
          <img src="${post.image}" alt="${post.title}" loading="lazy">
        </div>
      </div>
    `;

    const readMoreLink = article.querySelector('.read-more');
    if (readMoreLink) {
      readMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.GlobalLoader) {
          window.GlobalLoader.show('Loading article...');
        }
        setTimeout(() => {
          window.location.href = readMoreLink.href;
        }, 200);
      });
    }

    blogGrid.appendChild(article);

    if (timelineObserver) {
      timelineObserver.observe(article);
    }
  });

  currentPage = page;
  const hasNext = end < filteredPosts.length;
  updateLoadMoreState(hasNext);
}

function updateLoadMoreState(hasNext) {
  const loadMoreBtn = document.getElementById('load-more');
  const status = document.getElementById('timeline-status');

  if (!loadMoreBtn || !status) return;

  if (filteredPosts.length === 0) {
    loadMoreBtn.style.display = 'none';
    status.textContent = 'No stories available.';
    return;
  }

  loadMoreBtn.style.display = 'inline-flex';
  if (hasNext) {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load more stories';
  } else {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'You’re all caught up';
  }

  const shown = Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length);
  status.textContent = `Showing ${shown} of ${filteredPosts.length} stories`;
}

function handleLoadMoreClick() {
  const nextPage = currentPage + 1;
  renderBlogTimeline(nextPage, true);
}

/* ========================================
 * INITIALIZATION
 * ======================================== */
function init() {
  if (window.GlobalLoader) {
    window.GlobalLoader.show('Loading blog posts...');
  }

  initObserver();
  renderFeaturedPost();
  setupFilters();
  syncFilterUI();
  renderBlogTimeline(1, false);

  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', handleLoadMoreClick);
  }

  if (window.GlobalLoader) {
    setTimeout(() => window.GlobalLoader.hide(300), 200);
  }

  console.log('📰 Blog timeline initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
