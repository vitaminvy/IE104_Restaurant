import { renderFeaturedPost } from './renderFeatured.js';
import { renderBlogGrid } from './renderBlogGrid.js';
import { initPagination } from './pagination.js';

document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedPost();
    renderBlogGrid();
    initPagination(9); // hoặc lấy tổng số trang từ server
});
