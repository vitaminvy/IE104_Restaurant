// ===============================
// Sample Blog Data
// ===============================
const featuredPost = {
    image: '../assets/images/BlogPage/featured-post.png',
    title: 'Everything You Need To Know About The Growing Role Of AI In Restaurants',
    description: 'You are sitting in your favorite restaurant and have just ordered a meal. You took out your phone, scanned a QR code on your table, placed your order, and the food will appear in a few minutes, piping hot.',
    link: '#'
};

const blogPosts = [
    {
        image: '../assets/images/BlogPage/blog-post/blog-post-1.png',
        title: 'Is The Breakfast Forecast Partly Sunny Or Partly Cloudy?',
        date: 'August 4, 2023',
        author: 'Admin',
        link: '#'
    },
    {
        image: '../assets/images/BlogPage/blog-post/blog-post-2.png',
        title: 'Hiring Quickly (But Safely) As Dining Demand Picks Up',
        date: 'August 4, 2022',
        author: 'Admin',
        link: '#'
    },
    {
        image: '../assets/images/BlogPage/blog-post/blog-post-3.png',
        title: '5 Ways Restaurant Technology Makes Or Breaks Business',
        date: 'August 4, 2022',
        author: 'Admin',
        link: '#'
    },
    {
        image: '../assets/images/BlogPage/blog-post/blog-post-4.png',
        title: 'Save Inventory, Time And Labor Cost With Iot...',
        date: 'August 4, 2022',
        author: 'Admin',
        link: '#'
    },
    {
        image: '../assets/images/BlogPage/blog-post/blog-post-5.png',
        title: 'Using Live Video To Showcase Your Restaurant (Infographic)',
        date: 'August 4, 2023',
        author: 'Admin',
        link: '#'
    },
    {
        image: '../assets/images/BlogPage/blog-post/blog-post-6.png',
        title: 'Financial Well-Being Programs For Restaurants',
        date: 'August 4, 2022',
        author: 'Admin',
        link: '#'
    }
];

// ===============================
// Render Featured Post
// ===============================
const featuredContainer = document.getElementById('featured-post');
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

// ===============================
// Render Blog Grid
// ===============================
const blogGrid = document.getElementById('blog-grid');

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

// ===============================
// Pagination Logic (Simple)
// ===============================
const pagination = document.getElementById('pagination');
const totalPages = 9;
let currentPage = 1;

function renderPagination() {
    pagination.innerHTML = '';

    // Prev button
    const prev = document.createElement('a');
    prev.href = '#';
    prev.className = 'prev';
    prev.textContent = '← Previous';
    prev.onclick = () => { if (currentPage > 1) { currentPage--; renderPagination(); } };
    pagination.appendChild(prev);

    const pageContainer = document.createElement('div');
    pageContainer.className = 'page-numbers-container';

    const createPage = (num) => {
        const page = document.createElement('a');
        page.href = '#';
        page.className = 'page-numbers';
        if (num === currentPage) page.classList.add('current');
        page.textContent = num;
        page.onclick = () => { currentPage = num; renderPagination(); };
        return page;
    };

    const addEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'ellipsis';
        span.textContent = '...';
        return span;
    };

    const visiblePages = 3; // số trang xung quanh current

    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) pageContainer.appendChild(createPage(i));
    } else {
        let start = Math.max(currentPage - 1, 2);
        let end = Math.min(currentPage + 1, totalPages - 1);

        // Always show first page
        pageContainer.appendChild(createPage(1));

        if (start > 2) pageContainer.appendChild(addEllipsis());

        for (let i = start; i <= end; i++) pageContainer.appendChild(createPage(i));

        if (end < totalPages - 1) pageContainer.appendChild(addEllipsis());

        // Always show last page
        pageContainer.appendChild(createPage(totalPages));
    }

    pagination.appendChild(pageContainer);

    // Next button
    const next = document.createElement('a');
    next.href = '#';
    next.className = 'next';
    next.textContent = 'Next →';
    next.onclick = () => { if (currentPage < totalPages) { currentPage++; renderPagination(); } };
    pagination.appendChild(next);
}


renderPagination();
