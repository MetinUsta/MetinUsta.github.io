const MOBILE_QUERY = '(max-width: 1200px)';

function isMobileDevice() {
    return window.matchMedia(MOBILE_QUERY).matches;
}

function replaceWithImage(embed) {
    if (!embed.dataset.img) {
        return false;
    }

    embed.innerHTML = `<img src="${embed.dataset.img}" alt="Plot visualization" style="width: 100%; height: auto;">`;
    return true;
}

function executeScripts(container) {
    container.querySelectorAll('script').forEach((script) => {
        const newScript = document.createElement('script');
        Array.from(script.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = script.textContent;
        script.parentNode.replaceChild(newScript, script);
    });
}

async function loadEmbedSource(embed) {
    const response = await fetch(embed.dataset.src);
    const html = await response.text();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const body = wrapper.querySelector('body');
    embed.innerHTML = body ? body.innerHTML : wrapper.innerHTML;
    executeScripts(embed);
}

export async function hydrateEmbeddedHtml() {
    const embeds = document.querySelectorAll('.embedded-html');
    const mobile = isMobileDevice();

    for (const embed of embeds) {
        try {
            if (mobile && replaceWithImage(embed)) {
                continue;
            }
            await loadEmbedSource(embed);
        } catch (error) {
            console.error('Error loading embedded HTML:', error);
            embed.innerHTML = `<p class="error">Error loading ${embed.dataset.src}</p>`;
        }
    }
}
