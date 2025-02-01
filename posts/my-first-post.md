# The Complete Markdown Showcase 🎨

*Published: March 15, 2024*

Welcome to this comprehensive demonstration of Markdown features! This post will show you everything you can do with Markdown formatting.

## Basic Text Formatting

This is a regular paragraph with **bold text**, *italicized text*, and ***bold-italic text***. You can also use ~~strikethrough~~ for deleted text.

Here's a horizontal rule:

---

## Lists

### Unordered Lists
* First item
* Second item
  * Nested item
  * Another nested item
    * Even deeper nesting
* Third item

### Ordered Lists
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Task Lists
- [x] Write the blog post
- [ ] Add images
- [ ] Publish content

## Links and Images

[Visit my GitHub](https://github.com/yourusername)
[Internal link to first post](/posts/my-first-post)

<!-- ![Profile Picture](assets/photo.png) -->
*Caption: A beautiful landscape photo*

## Code Blocks

Inline code: `const greeting = "Hello, World!";`

multi-line code
```Python
def hello():
    print("Hello, World!")

if __name__ == "__main__":
    hello()

    a = 5

    for i in range(a):
        print(i)

    with open("test.txt", "w") as f:
        f.write("Hello, World!")
    
    raise Exception("This is an error")
```


## Blockquotes

> "The best way to predict the future is to invent it."
> 
> — Alan Kay

Nested quotes:
> First level
>> Second level
>>> Third level

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Tables | ✅ | With alignment |
| Images | ✅ | JPG, PNG, GIF |
| Code | ✅ | Multiple languages |

## Mathematical Expressions (if supported)

Inline math: $E = mc^2$

$$
\mathcal{L}_{\text{GRPO}}(\theta) = -\frac{1}{G} \sum_{i=1}^{G} \frac{1}{|o_i|} \sum_{t=1}^{|o_i|} \left[ \frac{\pi_\theta(o_{i,t} \mid q, o_{i,<t})}{\left[\pi_\theta(o_{i,t} \mid q, o_{i,<t})\right]_{\text{no grad}}} \, \hat{A}_{i,t} - \beta \, \mathbb{D}_{\text{KL}}\!\left[\pi_\theta \,\|\, \pi_{\text{ref}}\right] \right]
$$

Block math:
$$
\frac{n!}{k!(n-k)!} = \binom{n}{k}
$$

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Emojis

* 🚀 Project Launch
* 💡 New Idea
* 🐛 Bug Fix
* ✨ New Feature

## Collapsible Section (HTML-supported Markdown)

<details>
<summary>Summary</summary>

This is hidden content that can be expanded by clicking.
* You can put any content here
* Including lists
* And code blocks

</details>

## Final Notes

This post demonstrates most Markdown features you might need in a blog post. Remember that some features might require additional plugins or support from your Markdown parser.

---

*Last updated: March 15, 2024*