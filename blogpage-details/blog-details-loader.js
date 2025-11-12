/* ========================================
 * BLOG DETAILS DYNAMIC LOADER
 * Loads blog post content based on URL parameter
 * ======================================== */

import { 
  getBlogById, 
  getRelatedPosts 
} from '../assets/data/blogdata.js';

/* ========================================
 * URL PARAMETER HELPERS
 * ======================================== */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/* ========================================
 * RENDER BLOG HEADER
 * ======================================== */
function renderBlogHeader(post) {
  const header = document.querySelector('.blog-header');
  if (!header) return;

  header.innerHTML = `
    <h1>${post.title}</h1>
    <p>${post.excerpt}</p>
  `;
}

/* ========================================
 * RENDER MAIN IMAGE
 * ======================================== */
function renderMainImage(post) {
  const imageContainer = document.querySelector('.main-blog-image');
  if (!imageContainer) return;

  imageContainer.innerHTML = `
    <img src="${post.content.mainImage}" alt="${post.title}" loading="lazy">
  `;
}

/* ========================================
 * RENDER META INFO
 * ======================================== */
function renderMetaInfo(post) {
  const metaInfo = document.querySelector('.meta-info');
  if (!metaInfo) return;

  metaInfo.innerHTML = `
    <span>${post.date} • By ${post.author}</span>
    <div class="social-links">
      <button class="copy-link" onclick="copyBlogUrl()">
        <i class="fas fa-link"></i> Copy link
      </button>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
         target="_blank" 
         rel="noopener"
         aria-label="Share on Facebook">
        <i class="fab fa-facebook-f"></i>
      </a>
      <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}" 
         target="_blank" 
         rel="noopener"
         aria-label="Share on Twitter">
        <i class="fab fa-twitter"></i>
      </a>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
         target="_blank" 
         rel="noopener"
         aria-label="Share on LinkedIn">
        <i class="fab fa-linkedin-in"></i>
      </a>
    </div>
  `;
}

/* ========================================
 * RENDER BLOG CONTENT
 * ======================================== */
function renderBlogContent(post) {
  const contentSection = document.querySelector('.content-section');
  if (!contentSection) return;

  let contentHTML = '';

  // Render introduction paragraph
  if (post.content.intro) {
    contentHTML += `<p><span class="first-letter">${post.content.intro.charAt(0)}</span>${post.content.intro.slice(1)}</p>`;
  }

  // Render sections
  if (post.content.sections && post.content.sections.length > 0) {
    post.content.sections.forEach(section => {
      // Section heading
      if (section.heading) {
        contentHTML += `<h2>${section.heading}</h2>`;
      }

      // Section paragraphs
      if (section.paragraphs && section.paragraphs.length > 0) {
        section.paragraphs.forEach(paragraph => {
          contentHTML += `<p>${paragraph}</p>`;
        });
      }

      // Section image
      if (section.image) {
        contentHTML += `<img src="${section.image}" alt="${section.heading || 'Blog image'}" loading="lazy">`;
      }

      // Section list
      if (section.list && section.list.length > 0) {
        contentHTML += '<ul>';
        section.list.forEach(item => {
          contentHTML += `
            <li>
              <strong>${item.title}:</strong> ${item.description}
            </li>
          `;
        });
        contentHTML += '</ul>';
      }
    });
  }

  // Render quote
  if (post.content.quote) {
    contentHTML += `
      <blockquote class="blog-quote">
        <p>"${post.content.quote}"</p>
      </blockquote>
    `;
  }

  contentSection.innerHTML = contentHTML;
}

/* ========================================
 * RENDER RELATED POSTS
 * ======================================== */
function renderRelatedPosts(postId) {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;

  const relatedPosts = getRelatedPosts(postId, 2);

  if (relatedPosts.length === 0) {
    blogGrid.style.display = 'none';
    return;
  }

  blogGrid.innerHTML = '';

  relatedPosts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'post';
    article.innerHTML = `
      <div class="post-image">
        <img src="${post.image}" alt="${post.title}" loading="lazy">
      </div>
      <div class="post-content">
        <h3>${post.title}</h3>
        <p class="post-meta">${post.date} • By ${post.author}</p>
        <a href="./index.html?id=${post.id}" class="read-more">Read more</a>
      </div>
    `;
    blogGrid.appendChild(article);
  });
}

/* ========================================
 * UPDATE PAGE TITLE
 * ======================================== */
function updatePageTitle(post) {
  document.title = `${post.title} | Restaurant Blog`;
}

/* ========================================
 * COPY URL FUNCTION
 * ======================================== */
window.copyBlogUrl = function() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const copyBtn = document.querySelector('.copy-link');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      copyBtn.style.color = '#4CAF50';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.color = '';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy URL:', err);
    alert('Failed to copy link. Please copy manually.');
  });
};

/* ========================================
 * ERROR HANDLING
 * ======================================== */
function showError(message) {
  const container = document.querySelector('.container');
  if (!container) return;

  container.innerHTML = `
    <div style="
      text-align: center;
      padding: 80px 20px;
      color: rgba(255, 255, 255, 0.8);
    ">
      <i class="fas fa-exclamation-triangle" style="
        font-size: 64px;
        margin-bottom: 20px;
        color: var(--color-dark-orange, #fb8f2c);
      "></i>
      <h2 style="
        font-size: 32px;
        margin-bottom: 16px;
        color: white;
      ">${message}</h2>
      <p style="
        font-size: 18px;
        margin-bottom: 32px;
        opacity: 0.7;
      ">The blog post you're looking for doesn't exist or has been removed.</p>
      <a href="../blogpage/index.html" style="
        display: inline-block;
        padding: 12px 32px;
        background: var(--color-dark-orange, #fb8f2c);
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
        transition: opacity 0.3s ease;
      " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
        Back to Blog
      </a>
    </div>
  `;
}

/* ========================================
 * LOAD BLOG POST
 * ======================================== */
function loadBlogPost() {
  // Get blog ID from URL
  const blogId = getUrlParameter('id');

  // Check if ID is provided
  if (!blogId) {
    showError('Blog Post Not Found');
    console.error('No blog ID provided in URL');
    return;
  }

  // Get blog post data
  const post = getBlogById(blogId);

  // Check if post exists
  if (!post) {
    showError('Blog Post Not Found');
    console.error(`Blog post with ID ${blogId} not found`);
    return;
  }

  // Render all components
  try {
    updatePageTitle(post);
    renderBlogHeader(post);
    renderMainImage(post);
    renderMetaInfo(post);
    renderBlogContent(post);
    renderRelatedPosts(post.id);

    console.log('📰 Blog post loaded successfully:', post.title);
  } catch (error) {
    console.error('Error rendering blog post:', error);
    showError('Error Loading Blog Post');
  }
}

/* ========================================
 * INITIALIZATION
 * ======================================== */
function init() {
  loadBlogPost();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
