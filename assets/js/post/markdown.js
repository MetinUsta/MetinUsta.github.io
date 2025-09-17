const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
const DISPLAY_MATH_PATTERN = /\$\$([\s\S]*?)\$\$/g;
const INLINE_MATH_PATTERN = /\$(.*?)\$/g;

let markedConfigured = false;

function createImageRenderer() {
    return (href, title, text) => {
        if (!href) {
            return '';
        }

        let hrefValue = href;
        if (typeof href === 'object' && 'href' in href) {
            hrefValue = href.href;
        }

        try {
            const [url, width] = hrefValue.split('|width=');
            if (width) {
                return `<div style="text-align: center;"><img src="${url}" alt="${text || ''}" style="width:${width}px; height: auto; margin: 0 auto;"></div>`;
            }
            return `<div style="text-align: center;"><img src="${hrefValue}" alt="${text || ''}" style="margin: 0 auto;"></div>`;
        } catch (error) {
            console.error('Error processing image:', error);
            return `<img src="${hrefValue}" alt="${text || ''}">`;
        }
    };
}

function createHtmlEmbedExtension() {
    return {
        name: 'htmlFile',
        level: 'inline',
        start(src) {
            const match = src.match(/@\[html\]/);
            return match?.index;
        },
        tokenizer(src) {
            const rule = /^@\[html\]\((.*?)\s*,\s*image=(.*?)\)/;
            const match = rule.exec(src);
            if (match) {
                return {
                    type: 'htmlFile',
                    raw: match[0],
                    filepath: match[1],
                    imagepath: match[2]
                };
            }
            return undefined;
        },
        renderer(token) {
            return `<div class="embedded-panel"><div class="embedded-html" data-src="${token.filepath}" data-img="${token.imagepath}"></div></div>`;
        }
    };
}

function highlightCode(code, lang) {
    const { Prism } = window;
    if (lang && Prism?.languages?.[lang]) {
        try {
            const highlighted = Prism.highlight(code, Prism.languages[lang], lang);
            return `<pre class="line-numbers language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
        } catch (error) {
            console.error(error);
        }
    }
    return code;
}

function protectCodeBlocks(markdown) {
    const replacements = new Map();
    let counter = 0;

    const processed = markdown.replace(CODE_BLOCK_PATTERN, (match) => {
        const placeholder = `CODE_BLOCK_${counter}`;
        replacements.set(placeholder, match);
        counter += 1;
        return placeholder;
    });

    return { processed, replacements };
}

function restoreCodeBlocks(markdown, replacements) {
    let restored = markdown;
    replacements.forEach((value, key) => {
        restored = restored.replace(key, value);
    });
    return restored;
}

function renderDisplayMath(markdown) {
    return markdown.replace(DISPLAY_MATH_PATTERN, (match, expression) => {
        try {
            return window.katex.renderToString(expression.trim(), { displayMode: true });
        } catch (error) {
            console.error('KaTeX error:', error);
            return match;
        }
    });
}

function renderInlineMath(markdown) {
    return markdown.replace(INLINE_MATH_PATTERN, (match, expression) => {
        try {
            return window.katex.renderToString(expression.trim(), { displayMode: false });
        } catch (error) {
            console.error('KaTeX error:', error);
            return match;
        }
    });
}

function configureMarked() {
    const { marked, markedFootnote } = window;
    if (!marked || !markedFootnote) {
        throw new Error('Markdown libraries are not loaded.');
    }

    if (markedConfigured) {
        return;
    }

    marked.use(markedFootnote());
    marked.use({ renderer: { image: createImageRenderer() } });
    marked.use({ extensions: [createHtmlEmbedExtension()] });
    marked.setOptions({
        highlight: highlightCode,
        langPrefix: 'language-',
        gfm: true,
        breaks: true
    });

    markedConfigured = true;
}

function highlightLater() {
    if (window.Prism?.highlightAll) {
        queueMicrotask(() => {
            window.Prism.highlightAll();
        });
    }
}

export function renderMarkdown(markdown) {
    configureMarked();

    const { processed, replacements } = protectCodeBlocks(markdown);
    const withDisplayMath = renderDisplayMath(processed);
    const withInlineMath = renderInlineMath(withDisplayMath);
    const restored = restoreCodeBlocks(withInlineMath, replacements);
    const html = window.marked.parse(restored);

    highlightLater();
    return html;
}
