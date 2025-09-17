import { fetchJson } from './data.js';

export async function renderCollection({
    containerSelector,
    source,
    itemKey,
    emptyMessage = 'No entries found.',
    sort,
    template
}) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Container ${containerSelector} not found.`);
        return;
    }

    try {
        const data = await fetchJson(source);
        let items = itemKey ? data[itemKey] : data;
        if (!Array.isArray(items)) {
            console.error(`Expected an array at ${itemKey || 'root'} in ${source}.`);
            container.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }

        if (typeof sort === 'function') {
            items = [...items].sort(sort);
        }

        if (items.length === 0) {
            container.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }

        container.innerHTML = items.map(template).join('');
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="error">Unable to load content.</p>`;
    }
}
