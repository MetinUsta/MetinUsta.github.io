const loadedScripts = new Map();
const loadedStylesheets = new Map();
const preconnectLinks = new Map();

const SITE_ROOT = new URL('../../..', import.meta.url);
const ROOT_STYLESHEET = new URL('../../../styles.css', import.meta.url).pathname;
const PRISM_THEME = new URL('../../../prism-themes/prism-theme-github-copilot.css', import.meta.url).pathname;

const FONT_PRECONNECTS = [
    { href: 'https://fonts.googleapis.com' },
    { href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }
];

const BASE_STYLES = [
    ROOT_STYLESHEET,
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

const MARKDOWN_STYLES = [
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
    PRISM_THEME
];

const MARKDOWN_SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdn.jsdelivr.net/npm/marked-highlight/lib/index.umd.js',
    'https://cdn.jsdelivr.net/npm/marked-footnote/dist/index.umd.min.js',
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js'
];

const PLOTLY_SCRIPT = 'https://cdn.plot.ly/plotly-2.29.1.min.js';

function ensurePreconnect(link) {
    if (preconnectLinks.has(link.href)) {
        return;
    }

    const element = document.createElement('link');
    element.rel = 'preconnect';
    element.href = link.href;

    if (link.crossorigin) {
        element.crossOrigin = link.crossorigin;
    }

    document.head.appendChild(element);
    preconnectLinks.set(link.href, element);
}

function toAbsoluteUrl(path) {
    if (/^https?:/i.test(path)) {
        return path;
    }
    return new URL(path, window.location.origin).href;
}

function findExistingLink(href) {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(
        (link) => toAbsoluteUrl(link.href) === href
    );
}

function ensureStylesheet(href) {
    const absoluteHref = toAbsoluteUrl(href);
    if (loadedStylesheets.has(absoluteHref)) {
        return loadedStylesheets.get(absoluteHref);
    }

    const existingLink = findExistingLink(absoluteHref);
    if (existingLink) {
        const promise = Promise.resolve(existingLink);
        loadedStylesheets.set(absoluteHref, promise);
        return promise;
    }

    const promise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = absoluteHref;
        link.onload = () => resolve(link);
        link.onerror = (error) => reject(error);
        document.head.appendChild(link);
    });

    loadedStylesheets.set(absoluteHref, promise);
    return promise;
}

function findExistingScript(src) {
    return Array.from(document.querySelectorAll('script[src]')).find(
        (script) => toAbsoluteUrl(script.src) === src
    );
}

function ensureScript(src) {
    const absoluteSrc = toAbsoluteUrl(src);
    if (loadedScripts.has(absoluteSrc)) {
        return loadedScripts.get(absoluteSrc);
    }

    const existingScript = findExistingScript(absoluteSrc);
    if (existingScript) {
        const promise = new Promise((resolve, reject) => {
            if (existingScript.dataset.loaded === 'true') {
                resolve(existingScript);
                return;
            }
            existingScript.addEventListener('load', () => {
                existingScript.dataset.loaded = 'true';
                resolve(existingScript);
            }, { once: true });
            existingScript.addEventListener('error', reject, { once: true });
        });
        loadedScripts.set(absoluteSrc, promise);
        return promise;
    }

    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = absoluteSrc;
        script.async = false;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve(script);
        };
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
    });

    loadedScripts.set(absoluteSrc, promise);
    return promise;
}

export function ensureBaseStyles() {
    FONT_PRECONNECTS.forEach(ensurePreconnect);
    BASE_STYLES.forEach(ensureStylesheet);
}

export async function ensureMarkdownResources() {
    ensureBaseStyles();
    MARKDOWN_STYLES.forEach(ensureStylesheet);

    for (const script of MARKDOWN_SCRIPTS) {
        await ensureScript(script);
    }
}

export async function ensurePlotly() {
    await ensureScript(PLOTLY_SCRIPT);
}

export function resolveSitePath(path) {
    return new URL(path, SITE_ROOT).pathname;
}
