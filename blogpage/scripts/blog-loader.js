/* ========================================
 * BLOG PAGE DYNAMIC LOADER
 * Renders blog list with pagination
 * ======================================== */

import { 
  getFeaturedPost, 
  getPaginatedPosts 
} from '../../assets/data/blogdata.js';

/* ========================================
 * CONFIGURATION
 * ======================================== */
const POSTS_PER_PAGE = 6;
let currentPage = 1;

/* ========================================
 * RENDER FEATURED POST
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

  // Add click handler to featured post link
  const featuredLink = featuredContainer.querySelector('.read-more');
  if (featuredLink) {
    featuredLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Show global loader
      if (window.GlobalLoader) {
        window.GlobalLoader.show('Loading article...');
      }
      
      // Navigate after brief delay
      setTimeout(() => {
        window.location.href = featuredLink.href;
      }, 200);
    });
  }
}

/* ========================================
 * RENDER BLOG GRID
 * ======================================== */
function renderBlogGrid(page = 1) {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  // Get paginated posts
  const { posts, currentPage: pageNum, totalPages, hasNext, hasPrev } = getPaginatedPosts(page, POSTS_PER_PAGE);

  // Clear existing content
  blogGrid.innerHTML = '';

  // Check if there are posts
  if (posts.length === 0) {
    blogGrid.innerHTML = '<p class="no-posts">No blog posts available.</p>';
    return;
  }

  // Render each post
  posts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'post';
    article.innerHTML = `
      <div class="post-image">
        <img src="${post.image}" alt="${post.title}" loading="lazy">
      </div>
      <div class="post-content">
        <h3>${post.title}</h3>
        <p class="post-meta">${post.date} • By ${post.author}</p>
        <a href="../blogpage-details/index.html?id=${post.id}" class="read-more">Read more</a>
      </div>
    `;
    
    // Add click handler for smooth navigation
    const readMoreLink = article.querySelector('.read-more');
    if (readMoreLink) {
      readMoreLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Show global loader
        if (window.GlobalLoader) {
          window.GlobalLoader.show('Loading article...');
        }
        
        // Navigate after brief delay
        setTimeout(() => {
          window.location.href = readMoreLink.href;
        }, 200);
      });
    }
    
    blogGrid.appendChild(article);
  });

  // Update pagination
  renderPagination(pageNum, totalPages, hasNext, hasPrev);
  
  // Update current page
  currentPage = pageNum;
}

/* ========================================
 * RENDER PAGINATION
 * ======================================== */
function renderPagination(page, totalPages, hasNext, hasPrev) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  // Clear existing content
  paginationContainer.innerHTML = '';

  // Previous button
  const prevLink = document.createElement('a');
  prevLink.href = '#';
  prevLink.className = 'prev';
  prevLink.textContent = '← Previous';
  prevLink.setAttribute('data-page', page - 1);
  if (!hasPrev) {
    prevLink.style.opacity = '0.5';
    prevLink.style.pointerEvents = 'none';
  }
  paginationContainer.appendChild(prevLink);

  // Page numbers container
  const pageContainer = document.createElement('div');
  pageContainer.className = 'page-numbers-container';

  // Determine page range to display
  const maxVisiblePages = 6;
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pageContainer.appendChild(createPageNumber(i, page));
    }
  } else {
    // Show smart pagination with ellipsis
    let start = Math.max(page - 1, 2);
    let end = Math.min(page + 1, totalPages - 1);

    // Always show first page
    pageContainer.appendChild(createPageNumber(1, page));

    // Add ellipsis if needed
    if (start > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'ellipsis';
      ellipsis.textContent = '...';
      pageContainer.appendChild(ellipsis);
    }

    // Show middle pages
    for (let i = start; i <= end; i++) {
      pageContainer.appendChild(createPageNumber(i, page));
    }

    // Add ellipsis if needed
    if (end < totalPages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'ellipsis';
      ellipsis.textContent = '...';
      pageContainer.appendChild(ellipsis);
    }

    // Always show last page
    pageContainer.appendChild(createPageNumber(totalPages, page));
  }

  paginationContainer.appendChild(pageContainer);

  // Next button
  const nextLink = document.createElement('a');
  nextLink.href = '#';
  nextLink.className = 'next';
  nextLink.textContent = 'Next →';
  nextLink.setAttribute('data-page', page + 1);
  if (!hasNext) {
    nextLink.style.opacity = '0.5';
    nextLink.style.pointerEvents = 'none';
  }
  paginationContainer.appendChild(nextLink);

  // Attach event listeners
  attachPaginationListeners();
}

/* ========================================
 * CREATE PAGE NUMBER ELEMENT
 * ======================================== */
function createPageNumber(num, currentPage) {
  const pageLink = document.createElement('a');
  pageLink.href = '#';
  pageLink.className = 'page-numbers';
  if (num === currentPage) {
    pageLink.classList.add('current');
    pageLink.setAttribute('aria-current', 'page');
  }
  pageLink.textContent = num;
  pageLink.setAttribute('data-page', num);
  return pageLink;
}

/* ========================================
 * PAGINATION EVENT LISTENERS
 * ======================================== */
function attachPaginationListeners() {
  // Get all pagination links (prev, next, and page numbers)
  const allLinks = document.querySelectorAll('.prev, .next, .page-numbers');
  
  allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Skip if disabled
      if (link.style.pointerEvents === 'none') return;
      
      const page = parseInt(link.getAttribute('data-page'));
      
      if (page && page !== currentPage && page >= 1) {
        // Scroll to top of blog grid smoothly
        const blogGrid = document.getElementById('blog-grid');
        if (blogGrid) {
          blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Small delay for smooth scroll, then render new page
        setTimeout(() => {
          renderBlogGrid(page);
        }, 100);
      }
    });
  });
}

/* ========================================
 * INITIALIZATION
 * ======================================== */
function init() {
  // Show loader immediately
  if (window.GlobalLoader) {
    window.GlobalLoader.show('Loading blog posts...');
  }

  // Use setTimeout for rendering
  setTimeout(() => {
    // Render featured post
    renderFeaturedPost();
    
    // Render blog grid with first page
    renderBlogGrid(1);
    
    // Hide loader
    if (window.GlobalLoader) {
      window.GlobalLoader.hide(300);
    }
    
    console.log('📰 Blog page loaded successfully');
  }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
