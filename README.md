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

The first (and most important) is `ARI`. `ARI` stands for automated readability index, and we use it to check to readability. [^2]. Here's how:

If a sentence is greater than 11 words, we flag it with:

- Warning: "Hard to read" if the `ARI >= 10` and `ARI < 14`.
- Error: "Very hard to read" if the `ARI >= 14`.
- Error: If the sentence is longer than 25 words.

> Note: The average reader can only understand text at an 8th grade level. This is `ARI < 10` [^3]. The average reader will also find a sentence with more than 25 words very hard to read [^4].

The extension can analyze your writing using these libraries:

- [Proselint](https://github.com/amperser/proselint)
- [Write Good](https://github.com/btford/write-good)
- [Joblint](https://github.com/rowanmanning/joblint)

> Note: All three of these libraries are disabled by default. If desired, you can enable them in your VS Code Settings. You also must have `proselint` installed on your system for `proselint` to work. This extension will not install `proselint` for you! Finally, `proselint` can be a bit slow, so it does not run on every text change. Instead, you need to save the document for it too run.

## Footnotes

Managing Markdown footnotes is a pain. Use these commands to automate that task away!

- `Insert Footnote in File`. Insert a `url` on your clipboard as a Markdown footnote.

> Shortcut: `crtl + '` or `cmd + '`.

- `Reorder Footnotes in File`. Reorder all the footnotes in a Markdown file.

> Shortcut: `ctrl+shift+'` or `cmd+shift+'`.

## Links

Many tools use a type of link called a **wiki link** with double square brackets. These represent an internal link to another file in the folder. They have become widely adopted because they are short and easy to read. Here's how we use them:

Let's say you have a wiki link, [[security]], in a file called `cool.md`. If that link matches the name of another file, namely `security.md`, we will recognize it as a link. We will also handle variation in capitalization and pluralization. So you can write [[Security]] or [[securities]] in `cool.md` without error!

On the flip side, if there is no match, we will flag the link as a broken link.

[^1]: https://marketplace.visualstudio.com/items?itemName=successible.markdown-wiki
[^2]: https://en.m.wikipedia.org/wiki/Automated_readability_index
[^3]: https://readable.com/blog/what-is-the-average-persons-reading-level/
[^4]: https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/
