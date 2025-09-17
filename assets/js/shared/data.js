function resolveUrl(path) {
    return new URL(path, window.location.href).href;
}

async function fetchWithHandling(path, transform) {
    const response = await fetch(resolveUrl(path));
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    return transform(response);
}

export function fetchJson(path) {
    return fetchWithHandling(path, (response) => response.json());
}

export function fetchText(path) {
    return fetchWithHandling(path, (response) => response.text());
}
