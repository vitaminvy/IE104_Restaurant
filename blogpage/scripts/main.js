import { renderFeaturedPost } from './render-feature-post.js';
import { renderBlogGrid } from './render-blog-grid.js';
import { initPagination } from './pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedPost();
    renderBlogGrid();
    initPagination(9); // hoặc lấy tổng số trang từ server
});
