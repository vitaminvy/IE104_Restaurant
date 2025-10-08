import { featuredPost } from './data.js';

export function renderFeaturedPost() {
    const featuredContainer = document.getElementById('featured-post');
    if (!featuredContainer) return;

    featuredContainer.innerHTML = `
        <div class="post-image">
            <img src="${featuredPost.image}" alt="Featured Post Image">
        </div>
        <div class="post-content">
            <h2>${featuredPost.title}</h2>
            <p>${featuredPost.description}</p>
            <a href="${featuredPost.link}" class="read-more">Read more</a>
        </div>
    `;
}
