import { ensureBaseStyles } from './resources.js';
import { renderNavigation } from './navigation.js';

export function initPage(options = {}) {
    ensureBaseStyles();
    renderNavigation(options.activeNav);
}
