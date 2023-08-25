# 📙 Markdown Wiki

Keep a wiki in Visual Studio Code.

You can get this extension in two ways:

- Going directly to the Visual Studio marketplace [^1].
- Searching `markdown-wiki` in the Extensions Tab of Visual Studio Code.

This extension has three clusters of functionality:

- Analytics
- Footnotes
- Linking

Let's start with Analytics!

## Analytics

This extension has many options for analyzing your writing.

The first (and most important) is `ARI`. `ARI` stands for automated readability index. We use it to check to readability. [^2]. Here's how:

If a sentence is greater than 11 words, we flag it with:

- Warning: "Hard to read" if the `ARI >= 10` and `ARI < 14`
- Error: "Very hard to read" if the `ARI >= 14`
- Error: If the sentence is longer than 25 words

> Note: The average reader only understands text at an 8th grade level. This is `ARI < 10` [^3]. The average reader also finds a sentence with more than 25 words very hard to read [^4].

The extension can also analyze your writing using these libraries:

- Joblint [^5]. Bundled with the extension.
- Proselint [^6]. Must be installed on your system.
- Write Good [^7]. Bundled with the extension.

> Note: All of these libraries are disabled by default. If desired, you can enable them in your Visual Studio Code Settings. `proselint` can also be a bit slow, so it does not run on every text change. Instead, you need to save the document for `proselint` to run.

You may want to analyze more than just your open file. These commands make that possible.

- `Analyze Files`: Analyze every `.md` file in your workspace with enabled libraries. This command will also check for three other things. One, missing wiki links. Two, missing asset links. Three, missing or unmatched footnotes.

- `Delete Orphaned Assets`: Delete any asset not linked in a Markdown file. Specifically, this command will delete any files of type `png`, `jpeg`, `jpg`, `svg`, `gif`, `wav`, or `mp3`. This command is destructive, so use it carefully!

## Footnotes

Managing Markdown footnotes is a pain.

- Automatically check missing or unmatched footnotes in a file on every save.

- Automatically order footnotes and endnotes via `Ctrl/Cmd+ shift + '`. Pandoc must be installed on your system for this command to work [^8].

- Insert a `url` on your clipboard as a Markdown footnote via `Ctrl/Cmd+ '`. Your footnotes and endnotes will be ordered automatically after insertion.

## Linking

Wiki links represent an internal link to another file. They have become widely adopted because they are short and easy to read. Here's how we use them:

- You have the wiki link `[[security]]` in a file called `cool.md`.
- If that link matches the name of another file, `security.md`, we will recognize it as a link.
- We will also handle variation in capitalization and pluralization.
- So you can write `[[Security]]` or `[[securities]]` in `cool.md` without error!

On the flip side, if there is no match, we will flag the link as a broken link. We will also flag any asset link without a match. For example, if you write `![icon](/icon.png)` but `icon.png` does not exist, we will throw an error. Just make sure that each asset link is an absolute link. Otherwise, it will be flagged as missing by default!

[^1]: https://marketplace.visualstudio.com/items?itemName=successible.markdown-wiki
[^2]: https://en.m.wikipedia.org/wiki/Automated_readability_index
[^3]: https://readable.com/blog/what-is-the-average-persons-reading-level/
[^4]: https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/
[^5]: https://github.com/rowanmanning/joblint
[^6]: https://github.com/amperser/proselint
[^7]: https://github.com/btford/write-good
[^8]: https://pandoc.org/installing.html
