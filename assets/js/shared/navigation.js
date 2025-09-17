import { resolveSitePath } from './resources.js';

const NAV_ITEMS = [
    { id: 'portfolio', label: 'Portfolio', path: 'index.html' },
    { id: 'blog', label: 'Blog', path: 'blog.html' },
    { id: 'stuff', label: 'Stuff', path: 'stuff.html' }
];

function getActiveId(navElement, fallbackId) {
    const explicitActive = navElement?.dataset?.active;
    if (explicitActive) {
        return explicitActive;
    }

    if (fallbackId) {
        return fallbackId;
    }

    const currentPath = window.location.pathname;
    for (const item of NAV_ITEMS) {
        const resolvedPath = resolveSitePath(item.path);
        if (currentPath === resolvedPath) {
            return item.id;
        }

        if (item.id === 'portfolio' && (currentPath === '/' || currentPath === resolveSitePath('./'))) {
            return item.id;
        }
    }

    return null;
}

function createNavLink(item, activeId) {
    const link = document.createElement('a');
    link.href = resolveSitePath(item.path);
    link.textContent = item.label;
    link.classList.add('nav-button');

    if (item.id === activeId) {
        link.classList.add('active');
    }

    return link;
}

export function renderNavigation(fallbackActiveId) {
    const navElement = document.querySelector('nav[data-site-nav]');
    if (!navElement) {
        return;
    }

    navElement.textContent = '';
    const activeId = getActiveId(navElement, fallbackActiveId);

    NAV_ITEMS.forEach((item) => {
        const link = createNavLink(item, activeId);
        navElement.appendChild(link);
    });
}
