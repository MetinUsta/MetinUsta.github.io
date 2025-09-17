import { initPage } from '../shared/page.js';
import { ensureMarkdownResources, ensurePlotly } from '../shared/resources.js';
import { fetchText } from '../shared/data.js';
import { renderMarkdown } from './markdown.js';
import { hydrateEmbeddedHtml } from './embedded-content.js';

function getSlug() {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
}

function showError(message) {
    const container = document.getElementById('post');
    if (container) {
        container.innerHTML = `<p class="error">${message}</p>`;
    }
}

async function renderPost(slug) {
    try {
        const markdown = await fetchText(`posts/${slug}.md`);
        const container = document.getElementById('post');
        if (!container) {
            console.error('Post container not found.');
            return;
        }

        container.innerHTML = renderMarkdown(markdown);
        await hydrateEmbeddedHtml();
    } catch (error) {
        console.error('Error loading blog post:', error);
        showError('Unable to load the requested post.');
    }
}

async function init() {
    initPage({ activeNav: 'blog' });
    await ensureMarkdownResources();
    await ensurePlotly();

    const slug = getSlug();
    if (!slug) {
        showError('Post not found.');
        return;
    }

    await renderPost(slug);
}

init().catch((error) => {
    console.error(error);
    showError('Something went wrong while loading the post.');
});
