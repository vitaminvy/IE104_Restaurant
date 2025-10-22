import { blogPosts } from '../../assets/data/blogpage.js';

export function renderBlogGrid() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    blogPosts.forEach(post => {
        const article = document.createElement('article');
        article.className = 'post';
        article.innerHTML = `
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}">
            </div>
            <div class="post-content">
                <h3>${post.title}</h3>
                <p class="post-meta">${post.date} • By ${post.author}</p>
                <a href="${post.link}" class="read-more">Read more</a>
            </div>
        `;
        blogGrid.appendChild(article);
    });
}
