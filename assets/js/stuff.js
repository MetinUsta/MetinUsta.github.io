import { initPage } from './shared/page.js';
import { renderCollection } from './shared/collection.js';

initPage({ activeNav: 'stuff' });

renderCollection({
    containerSelector: '#stuff-cards',
    source: 'stuff/stuff.json',
    itemKey: 'cards',
    emptyMessage: 'No stuff found.',
    template: (card) => `
        <a href="${card.link}" class="stuff-card" style="background-color: ${card.theme || '#fff'};">
            <div class="stuff-card-bg">
                ${card.image ? `<img src="${card.image}" alt="${card.title} background" />` : ''}
            </div>
            <div class="stuff-card-content">
                <h2>${card.title}</h2>
                <p>${card.subtitle}</p>
            </div>
        </a>
    `
});
