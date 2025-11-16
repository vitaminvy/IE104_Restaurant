/* ========================================
 * BLOG DATA
 * Comprehensive blog posts with full content
 * ======================================== */

export const blogPosts = [
  {
    id: 1,
    slug: 'ai-role-in-restaurants',
    title: 'blog.post1.title',
    excerpt: 'blog.post1.excerpt',
    description: 'blog.post1.description',
    image: '../assets/images/blog-page/featured-post.png',
    category: 'Technology',
    tags: ['AI', 'Innovation', 'Restaurant Tech', 'Automation'],
    author: 'Admin',
    date: 'blog.date.august_6_2025',
    readTime: '8 min read',
    featured: true,
    content: {
      intro: 'blog.post1.content.intro',
      sections: [
        {
          heading: 'blog.post1.content.sections.0.heading',
          paragraphs: [
            'blog.post1.content.sections.0.paragraphs.0',
            'blog.post1.content.sections.0.paragraphs.1'
          ],
          image: '../assets/images/blogpage-details/pizza.png'
        },
        {
          heading: 'blog.post1.content.sections.1.heading',
          paragraphs: [
            'blog.post1.content.sections.1.paragraphs.0'
          ],
          list: [
            {
              title: 'blog.post1.content.sections.1.list.0.title',
              description: 'blog.post1.content.sections.1.list.0.description'
            },
            {
              title: 'blog.post1.content.sections.1.list.1.title',
              description: 'blog.post1.content.sections.1.list.1.description'
            }
          ]
        }
      ],
      quote: 'blog.post1.content.quote',
      mainImage: '../assets/images/blogpage-details/interior-of-restaurant.png'
    },
    relatedPosts: [2, 5]
  },
  {
    id: 2,
    slug: 'breakfast-forecast',
    title: 'blog.post2.title',
    excerpt: 'blog.post2.excerpt',
    description: 'blog.post2.description',
    image: '../assets/images/blog-page/blog-post/blog-post-1.png',
    category: 'Trends',
    author: 'Admin',
    date: 'blog.date.august_4_2024',
    readTime: '5 min read',
    featured: false,
    content: {
      intro: 'blog.post2.content.intro',
      sections: [
        {
          heading: 'blog.post2.content.sections.0.heading',
          paragraphs: [
            'blog.post2.content.sections.0.paragraphs.0',
            'blog.post2.content.sections.0.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post2.content.sections.1.heading',
          paragraphs: [
            'blog.post2.content.sections.1.paragraphs.0',
            'blog.post2.content.sections.1.paragraphs.1'
          ]
        }
      ],
      quote: 'blog.post2.content.quote',
      mainImage: '../assets/images/blog-page/blog-post/blog-post-1.png'
    },
    relatedPosts: [3, 6]
  },
  {
    id: 3,
    slug: 'hiring-safely-dining-demand',
    title: 'blog.post3.title',
    excerpt: 'blog.post3.excerpt',
    description: 'blog.post3.description',
    image: '../assets/images/blog-page/blog-post/blog-post-2.png',
    category: 'Management',
    author: 'Admin',
    date: 'blog.date.august_4_2025',
    readTime: '6 min read',
    featured: false,
    content: {
      intro: 'blog.post3.content.intro',
      sections: [
        {
          heading: 'blog.post3.content.sections.0.heading',
          paragraphs: [
            'blog.post3.content.sections.0.paragraphs.0',
            'blog.post3.content.sections.0.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post3.content.sections.1.heading',
          paragraphs: [
            'blog.post3.content.sections.1.paragraphs.0',
            'blog.post3.content.sections.1.paragraphs.1'
          ]
        }
      ],
      quote: 'blog.post3.content.quote',
      mainImage: '../assets/images/blog-page/blog-post/blog-post-2.png'
    },
    relatedPosts: [4, 6]
  },
  {
    id: 4,
    slug: 'restaurant-technology-makes-breaks',
    title: 'blog.post4.title',
    excerpt: 'blog.post4.excerpt',
    description: 'blog.post4.description',
    image: '../assets/images/blog-page/blog-post/blog-post-3.png',
    category: 'Technology',
    tags: ['Technology', 'POS Systems', 'Digital Transformation', 'Operations'],
    author: 'Admin',
    date: 'blog.date.august_4_2025',
    readTime: '7 min read',
    featured: false,
    content: {
      intro: 'blog.post4.content.intro',
      sections: [
        {
          heading: 'blog.post4.content.sections.0.heading',
          paragraphs: [
            'blog.post4.content.sections.0.paragraphs.0',
            'blog.post4.content.sections.0.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post4.content.sections.1.heading',
          paragraphs: [
            'blog.post4.content.sections.1.paragraphs.0',
            'blog.post4.content.sections.1.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post4.content.sections.2.heading',
          paragraphs: [
            'blog.post4.content.sections.2.paragraphs.0',
            'blog.post4.content.sections.2.paragraphs.1'
          ]
        }
      ],
      quote: 'blog.post4.content.quote',
      mainImage: '../assets/images/blog-page/blog-post/blog-post-3.png'
    },
    relatedPosts: [1, 5]
  },
  {
    id: 5,
    slug: 'iot-saves-inventory-costs',
    title: 'blog.post5.title',
    excerpt: 'blog.post5.excerpt',
    description: 'blog.post5.description',
    image: '../assets/images/blog-page/blog-post/blog-post-4.png',
    category: 'Technology',
    tags: ['IoT', 'Inventory', 'Cost Control', 'Efficiency'],
    author: 'Admin',
    date: 'blog.date.august_4_2025',
    readTime: '6 min read',
    featured: false,
    content: {
      intro: 'blog.post5.content.intro',
      sections: [
        {
          heading: 'blog.post5.content.sections.0.heading',
          paragraphs: [
            'blog.post5.content.sections.0.paragraphs.0',
            'blog.post5.content.sections.0.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post5.content.sections.1.heading',
          paragraphs: [
            'blog.post5.content.sections.1.paragraphs.0',
            'blog.post5.content.sections.1.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post5.content.sections.2.heading',
          paragraphs: [
            'blog.post5.content.sections.2.paragraphs.0',
            'blog.post5.content.sections.2.paragraphs.1'
          ]
        }
      ],
      quote: 'blog.post5.content.quote',
      mainImage: '../assets/images/blog-page/blog-post/blog-post-4.png'
    },
    relatedPosts: [1, 4]
  },
  {
    id: 6,
    slug: 'live-video-showcase-restaurant',
    title: 'blog.post6.title',
    excerpt: 'blog.post6.excerpt',
    description: 'blog.post6.description',
    image: '../assets/images/blog-page/blog-post/blog-post-5.png',
    category: 'Marketing',
    tags: ['Marketing', 'Social Media', 'Live Video', 'Customer Engagement'],
    author: 'Admin',
    date: 'blog.date.august_4_2024',
    readTime: '5 min read',
    featured: false,
    content: {
      intro: 'blog.post6.content.intro',
      sections: [
        {
          heading: 'blog.post6.content.sections.0.heading',
          paragraphs: [
            'blog.post6.content.sections.0.paragraphs.0',
            'blog.post6.content.sections.0.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post6.content.sections.1.heading',
          paragraphs: [
            'blog.post6.content.sections.1.paragraphs.0',
            'blog.post6.content.sections.1.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post6.content.sections.2.heading',
          paragraphs: [
            'blog.post6.content.sections.2.paragraphs.0',
            'blog.post6.content.sections.2.paragraphs.1'
          ]
        }
      ],
      quote: 'blog.post6.content.quote',
      mainImage: '../assets/images/blogpage-details/post-image-1.png'
    },
    relatedPosts: [2, 7]
  },
  {
    id: 7,
    slug: 'financial-wellbeing-programs',
    title: 'blog.post7.title',
    excerpt: 'blog.post7.excerpt',
    description: 'blog.post7.description',
    image: '../assets/images/blog-page/blog-post/blog-post-6.png',
    category: 'Management',
    tags: ['Employee Benefits', 'Financial Wellness', 'Staff Retention', 'HR'],
    author: 'Admin',
    date: 'blog.date.august_4_2025',
    readTime: '6 min read',
    featured: false,
    content: {
      intro: 'blog.post7.content.intro',
      sections: [
        {
          heading: 'blog.post7.content.sections.0.heading',
          paragraphs: [
            'blog.post7.content.sections.0.paragraphs.0',
            'blog.post7.content.sections.0.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post7.content.sections.1.heading',
          paragraphs: [
            'blog.post7.content.sections.1.paragraphs.0',
            'blog.post7.content.sections.1.paragraphs.1'
          ]
        },
        {
          heading: 'blog.post7.content.sections.2.heading',
          paragraphs: [
            'blog.post7.content.sections.2.paragraphs.0',
            'blog.post7.content.sections.2.paragraphs.1'
          ]
        }
      ],
      quote: 'blog.post7.content.quote',
      mainImage: '../assets/images/blogpage-details/post-image-2.png'
    },
    relatedPosts: [3, 6]
  }
];

/* ========================================
 * UTILITY FUNCTIONS
 * ======================================== */

/**
 * Get blog post by ID
 * @param {number} id - Blog post ID
 * @returns {object|null} Blog post object or null if not found
 */
export function getBlogById(id) {
  return blogPosts.find(post => post.id === parseInt(id)) || null;
}

/**
 * Get blog post by slug
 * @param {string} slug - Blog post slug
 * @returns {object|null} Blog post object or null if not found
 */
export function getBlogBySlug(slug) {
  return blogPosts.find(post => post.slug === slug) || null;
}

/**
 * Get featured blog post
 * @returns {object|null} Featured blog post or first post if none featured
 */
export function getFeaturedPost() {
  return blogPosts.find(post => post.featured === true) || blogPosts[0] || null;
}

/**
 * Get related blog posts
 * @param {number} postId - Current post ID
 * @param {number} limit - Number of related posts to return
 * @returns {array} Array of related blog posts
 */
export function getRelatedPosts(postId, limit = 2) {
  const currentPost = getBlogById(postId);
  if (!currentPost) return [];

  // If post has defined related posts, use those
  if (currentPost.relatedPosts && currentPost.relatedPosts.length > 0) {
    return currentPost.relatedPosts
      .map(id => getBlogById(id))
      .filter(post => post !== null)
      .slice(0, limit);
  }

  // Otherwise, get posts from same category
  return blogPosts
    .filter(post => 
      post.id !== postId && 
      post.category === currentPost.category
    )
    .slice(0, limit);
}

/**
 * Get blog posts by category
 * @param {string} category - Category name
 * @returns {array} Array of blog posts in category
 */
export function getBlogsByCategory(category) {
  return blogPosts.filter(post => post.category === category);
}

/**
 * Get paginated blog posts
 * @param {number} page - Page number (1-indexed)
 * @param {number} perPage - Posts per page
 * @returns {object} Object with posts array and pagination info
 */
export function getPaginatedPosts(page = 1, perPage = 6) {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedPosts = blogPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    currentPage: page,
    totalPages: Math.ceil(blogPosts.length / perPage),
    totalPosts: blogPosts.length,
    hasNext: endIndex < blogPosts.length,
    hasPrev: page > 1
  };
}

/**
 * Get all blog categories
 * @returns {array} Array of unique categories
 */
export function getAllCategories() {
  return [...new Set(blogPosts.map(post => post.category))];
}

/**
 * Get all blog tags
 * @returns {array} Array of unique tags
 */
export function getAllTags() {
  const allTags = blogPosts.flatMap(post => post.tags);
  return [...new Set(allTags)];
}
