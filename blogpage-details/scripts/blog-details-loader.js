/* ========================================
 * BLOG DETAILS DYNAMIC LOADER
 * Loads blog post content based on URL parameter
 * ======================================== */

import { 
  getBlogById, 
  getRelatedPosts 
} from '../../assets/data/blogdata.js';
import i18nService from '../../assets/script/i18n-service.js';

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

  const title = i18nService.t(post.title);
  const excerpt = i18nService.t(post.excerpt);

  header.innerHTML = `
    <h1>${title}</h1>
    <p>${excerpt}</p>
  `;
}

/* ========================================
 * RENDER MAIN IMAGE
 * ======================================== */
function renderMainImage(post) {
  const imageContainer = document.querySelector('.main-blog-image');
  if (!imageContainer) return;

  const title = i18nService.t(post.title);

  imageContainer.innerHTML = `
    <img src="${post.content.mainImage}" alt="${title}" loading="lazy">
  `;
}

/* ========================================
 * RENDER META INFO
 * ======================================== */
function renderMetaInfo(post) {
  const metaInfo = document.querySelector('.meta-info');
  if (!metaInfo) return;

  const title = i18nService.t(post.title);

  metaInfo.innerHTML = `
    <span>${i18nService.t(post.date)} • ${i18nService.t('blog_details_page.by_author')} ${post.author}</span>
    <div class="social-links">
      <button class="copy-link" onclick="copyBlogUrl()">
        <i class="fas fa-link"></i> ${i18nService.t('blog_details_page.copy_link')}
      </button>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" 
         target="_blank" 
         rel="noopener"
         aria-label="Share on Facebook">
        <i class="fab fa-facebook-f"></i>
      </a>
      <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}" 
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
  const intro = i18nService.t(post.content.intro);
  if (intro) {
    contentHTML += `<p><span class="first-letter">${intro.charAt(0)}</span>${intro.slice(1)}</p>`;
  }

  // Render sections
  if (post.content.sections && post.content.sections.length > 0) {
    post.content.sections.forEach((section, sectionIndex) => {
      // Section heading
      const heading = i18nService.t(section.heading);
      if (heading) {
        contentHTML += `<h2>${heading}</h2>`;
      }

      // Section paragraphs
      if (section.paragraphs && section.paragraphs.length > 0) {
        section.paragraphs.forEach((paragraphKey, pIndex) => {
          const paragraph = i18nService.t(paragraphKey);
          contentHTML += `<p>${paragraph}</p>`;
        });
      }

      // Section image
      if (section.image) {
        contentHTML += `<img src="${section.image}" alt="${heading || 'Blog image'}" loading="lazy">`;
      }

      // Section list
      if (section.list && section.list.length > 0) {
        contentHTML += '<ul>';
        section.list.forEach((item, itemIndex) => {
          const itemTitle = i18nService.t(item.title);
          const itemDescription = i18nService.t(item.description);
          contentHTML += `
            <li>
              <strong>${itemTitle}:</strong> ${itemDescription}
            </li>
          `;
        });
        contentHTML += '</ul>';
      }
    });
  }

  // Render quote
  const quote = i18nService.t(post.content.quote);
  if (quote) {
    contentHTML += `
      <blockquote class="blog-quote">
        <p>"${quote}"</p>
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
    const title = i18nService.t(post.title);
    const article = document.createElement('article');
    article.className = 'post';
    article.innerHTML = `
      <div class="post-image">
        <img src="${post.image}" alt="${title}" loading="lazy">
      </div>
      <div class="post-content">
        <h3>${title}</h3>
        <p class="post-meta">${i18nService.t(post.date)} • ${i18nService.t('blog_details_page.by_author')} ${post.author}</p>
        <a href="./index.html?id=${post.id}" class="read-more">${i18nService.t('blog_page.read_more')}</a>
      </div>
    `;
    blogGrid.appendChild(article);
  });
}

/* ========================================
 * UPDATE PAGE TITLE
 * ======================================== */
function updatePageTitle(post) {
  const title = i18nService.t(post.title);
  document.title = `${title} ${i18nService.t('blog_details_page.page_title_suffix')}`;
}

/* ========================================
 * COPY URL FUNCTION
 * ======================================== */
window.copyBlogUrl = function() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const copyBtn = document.querySelector('.copy-link');
    if (copyBtn) {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fas fa-check"></i> ${i18nService.t('blog_details_page.copied')}`;
      copyBtn.style.color = '#4CAF50';
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.color = '';
      }, 2000);
    }
  }).catch(err => {
    // console.error('Failed to copy URL:', err);
    alert(i18nService.t('blog_details_page.copy_failed'));
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
    ">
      <i class="fas fa-exclamation-triangle" style="
        font-size: 64px;
        margin-bottom: 20px;
        color: var(--color-dark-orange, #fb8f2c);
      "></i>
      <h2 style="
        font-size: 32px;
        margin-bottom: 16px;
      ">${message}</h2>
      <p style="
        font-size: 18px;
        margin-bottom: 32px;
      ">${i18nService.t('blog_details_page.error.description')}</p>
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
        ${i18nService.t('blog_details_page.error.back_to_blog')}
      </a>
    </div>
  `;
}

/* ========================================
 * LOAD BLOG POST
 * ======================================== */
async function loadBlogPost() {
  // Get blog ID from URL
  const blogId = getUrlParameter('id');

  // Check if ID is provided
  if (!blogId) {
    showError(i18nService.t('blog_details_page.error.not_found'));
    // console.error('No blog ID provided in URL');
    return;
  }

  // Get blog post data
  const post = getBlogById(blogId);

  // Check if post exists
  if (!post) {
    showError(i18nService.t('blog_details_page.error.not_found'));
    // console.error(`Blog post with ID ${blogId} not found`);
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

    // console.log('Blog post loaded successfully:', i18nService.t(post.title));
  } catch (error) {
    // console.error('Error rendering blog post:', error);
    showError(i18nService.t('blog_details_page.error.loading_error'));
  }
}

/* ========================================
 * INITIALIZATION
 * ======================================== */
function init() {
  loadBlogPost();
}

document.addEventListener('language-changed', init);

if (Object.keys(i18nService.getTranslations()).length > 0) {
  init();
}
