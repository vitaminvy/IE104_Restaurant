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
import i18nService from '../../assets/script/i18n-service.js';

const POSTS_PER_PAGE = 4;
let currentPage = 1;
let filteredPosts = [...blogPosts];
let selectedCategory = 'all';
let selectedTag = null;
let timelineObserver = null;

function getLocalizedReadTime(readTimeValue) {
  if (!readTimeValue) {
    const fallback = i18nService.t('blog_page.read_time.na');
    return fallback && fallback !== 'blog_page.read_time.na' ? fallback : 'Read time N/A';
  }
  const minutes = parseInt(readTimeValue, 10);
  if (Number.isNaN(minutes)) {
    return readTimeValue;
  }
  const template = i18nService.t('blog_page.read_time.template');
  if (template && template !== 'blog_page.read_time.template') {
    return template.replace('{minutes}', minutes);
  }
  return `${minutes} min read`;
}

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

  const title = i18nService.t(post.title);
  const description = i18nService.t(post.description);

  featuredContainer.innerHTML = `
    <div class="post-image">
      <img src="${post.image}" alt="${title}" loading="lazy">
    </div>
    <div class="post-content">
      <h2>${title}</h2>
      <p>${description}</p>
      <a href="../blogpage-details/index.html?id=${post.id}" class="read-more">${i18nService.t('blog_page.read_more')}</a>
    </div>
  `;

  const featuredLink = featuredContainer.querySelector('.read-more');
  if (featuredLink) {
    featuredLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.GlobalLoader) {
        window.GlobalLoader.show(i18nService.t('blog_page.loading_article'));
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
  const tagTranslations = i18nService.getTranslations()?.blog?.tags || {};

  getAllTags().forEach((tag) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'blog-filter-pill';
    pill.dataset.tag = tag;
    pill.textContent = tagTranslations[tag] || tag;
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
    const tags = post.tags || [];
    const tagMatch = !selectedTag || tags.includes(selectedTag);
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
    blogGrid.innerHTML = `<p class="no-posts">${i18nService.t('blog_page.filter_empty')}</p>`;
    updateLoadMoreState(false);
    return;
  }

  const tagTranslations = i18nService.getTranslations()?.blog?.tags || {};

  postsToRender.forEach((post) => {
    const readTime = getLocalizedReadTime(post.readTime);
    const title = i18nService.t(post.title);
    const excerpt = i18nService.t(post.excerpt) || i18nService.t(post.description) || '';
    const postDate = i18nService.t(post.date);
    const readMoreText = i18nService.t('blog_page.read_more');
    const authorLabel = `${i18nService.t('blog_page.by_author')} ${post.author}`;

    const article = document.createElement('article');
    article.className = 'timeline-entry';

    article.innerHTML = `
      <div class="timeline-entry__marker">
        <span class="timeline-entry__dot" aria-hidden="true"></span>
        <span class="timeline-entry__date">${postDate}</span>
      </div>
      <div class="timeline-entry__card">
        <div>
          <div class="timeline-entry__meta">
            <span class="timeline-entry__category">${post.category}</span>
            <span>${authorLabel}</span>
            <span class="timeline-entry__readtime">${readTime}</span>
          </div>
          <h3 class="timeline-entry__heading">${title}</h3>
          <p class="timeline-entry__excerpt">${excerpt}</p>
          <div class="timeline-entry__tags">
            ${(post.tags || [])
              .map((tag) => {
                const label = tagTranslations[tag] || tag;
                return `<span class="timeline-entry__tag">${label}</span>`;
              })
              .join('')}
          </div>
          <div class="timeline-entry__actions">
            <a href="../blogpage-details/index.html?id=${post.id}" class="read-more">${readMoreText}</a>
          </div>
        </div>
        <div class="timeline-entry__image">
          <img src="${post.image}" alt="${title}" loading="lazy">
        </div>
      </div>
    `;

    const readMoreLink = article.querySelector('.read-more');
    if (readMoreLink) {
      readMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.GlobalLoader) {
          window.GlobalLoader.show(i18nService.t('blog_page.loading_article'));
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
    status.textContent = i18nService.t('blog_page.no_stories');
    return;
  }

  loadMoreBtn.style.display = 'inline-flex';
  if (hasNext) {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = i18nService.t('blog_page.load_more');
  } else {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = i18nService.t('blog_page.caught_up');
  }

  const shown = Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length);
  const statusTemplate = i18nService.t('blog_page.showing_count');
  if (statusTemplate && statusTemplate !== 'blog_page.showing_count') {
    status.textContent = statusTemplate
      .replace('{current}', shown)
      .replace('{total}', filteredPosts.length);
  } else {
    status.textContent = `Showing ${shown} of ${filteredPosts.length} stories`;
  }
}

function handleLoadMoreClick() {
  const nextPage = currentPage + 1;
  renderBlogTimeline(nextPage, true);
}

/* ========================================
 * NEWSLETTER FORM HANDLER
 * ======================================== */
function setupNewsletterForm() {
  const form = document.querySelector('.newsletter__form');
  const successMessage = document.getElementById('newsletter-success');
  if (!form || !successMessage) return;

  const emailInput = form.querySelector('input[type="email"]');
  const submitBtn = form.querySelector('.newsletter__submit');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!emailInput || !emailInput.value.trim()) {
      emailInput?.focus();
      emailInput?.reportValidity?.();
      return;
    }

    submitBtn.disabled = true;
    successMessage.classList.remove('is-visible');
    successMessage.textContent = '';

    setTimeout(() => {
      const nameHint = emailInput.value.split('@')[0] || 'friend';
      successMessage.textContent = `Thanks, ${nameHint}! Check your inbox for our latest stories.`;
      successMessage.classList.add('is-visible');
      form.reset();
      submitBtn.disabled = false;
    }, 600);
  });

  emailInput?.addEventListener('input', () => {
    successMessage.classList.remove('is-visible');
    successMessage.textContent = '';
  });
}

/* ========================================
 * INITIALIZATION
 * ======================================== */
let langInitialized = false;

async function init() {
  if (!langInitialized) {
    await i18nService.init();
    langInitialized = true;
  }
  renderPage();
}

function renderPage() {
  if (window.GlobalLoader) {
    window.GlobalLoader.show(i18nService.t('blog_page.loading_posts'));
  }

  if (!timelineObserver) {
    initObserver();
  }

  renderFeaturedPost();
  setupFilters();
  syncFilterUI();
  renderBlogTimeline(1, false);
  setupNewsletterForm();

  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.removeEventListener('click', handleLoadMoreClick);
    loadMoreBtn.addEventListener('click', handleLoadMoreClick);
  }

  if (window.GlobalLoader) {
    setTimeout(() => window.GlobalLoader.hide(300), 200);
  }

  console.log('📰 Blog timeline initialized');
}

document.addEventListener('language-changed', () => {
  renderPage();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
