# 📙 Markdown Wiki

Create and manage a Markdown wiki using Visual Studio Code.

You can get this extension in two ways:

- Going directly to the Visual Studio Code marketplace [^1].
- Searching `markdown-wiki` in the Extensions Tab of Visual Studio Code.

This extension has three clusters of functionality:

- Analysis
- Footnotes
- Links

Let's start with Analysis!

## Analysis

This extension has many options for analyzing your writing.

The first (and most important) is `ARI`. `ARI` stands for automated readability index. We use it to check to readability. [^2]. Here's how:

If a sentence is greater than 11 words, we flag it with:

- Warning: "Hard to read" if the `ARI >= 10` and `ARI < 14`
- Error: "Very hard to read" if the `ARI >= 14`
- Error: If the sentence is longer than 25 words

> Note: The average reader can only understand text at an 8th grade level. This is `ARI < 10` [^3]. The average reader will also find a sentence with more than 25 words very hard to read [^4].

The extension can also analyze your writing using these libraries:

- Joblint [^7]. Bundled with the extension
- Proselint [^5]. Must be installed on your system
- Write Good [^6]. Bundled with the extension

> Note: All of these libraries are disabled by default. If desired, you can enable them in your VS Code Settings. `proselint` can also be a bit slow, so it does not run on every text change. Instead, you need to save the document for `proselint` to run.

## Footnotes

Managing Markdown footnotes is a pain. Use these commands to automate that task away!

### Insert Footnote

- Task: Insert a `url` on your clipboard as a Markdown footnote
- Shortcut: <kbd>Ctrl/Cmd</kbd> + <kbd>'</kbd>

### Reorder Footnotes

- Task: Reorder all the footnotes in a Markdown file
- Shortcut: <kbd>Ctrl/Cmd</kbd> + <kbd>Shift</kbd> + <kbd>'</kbd>

## Links

Many tools use a type of link called a wiki link with double square brackets. These represent an internal link to another file in the folder. They have become widely adopted because they are short and easy to read. Here's how we use them:

Let's say you have a wiki link, [[security]], in a file called `cool.md`. If that link matches the name of another file, namely `security.md`, we will recognize it as a link. We will also handle variation in capitalization and pluralization. So you can write [[Security]] or [[securities]] in `cool.md` without error!

On the flip side, if there is no match, we will flag the link as a broken link.

[^1]: https://marketplace.visualstudio.com/items?itemName=successible.markdown-wiki
[^2]: https://en.m.wikipedia.org/wiki/Automated_readability_index
[^3]: https://readable.com/blog/what-is-the-average-persons-reading-level/
[^4]: https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/
[^5]: https://github.com/amperser/proselint
[^6]: https://github.com/btford/write-good
[^7]: https://github.com/rowanmanning/joblint
