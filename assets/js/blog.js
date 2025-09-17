import { initPage } from './shared/page.js';
import { renderCollection } from './shared/collection.js';

initPage({ activeNav: 'blog' });

renderCollection({
    containerSelector: '#blog-posts',
    source: 'posts/posts.json',
    itemKey: 'posts',
    emptyMessage: 'No blog posts found.',
    sort: (a, b) => new Date(b.date) - new Date(a.date),
    template: (post) => `
        <a href="post.html?slug=${post.slug}" class="blog-card" style="background-color: ${post.theme || '#f9f9f9'}">
            <div class="blog-emoji">${post.emoji || '📝'}</div>
            <h2>${post.title}</h2>
            <p class="blog-date">${new Date(post.date).toLocaleDateString()}</p>
            <p>${post.excerpt}</p>
        </a>
    `
});
