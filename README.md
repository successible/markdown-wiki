# Markdown Wiki

Create and manage a Markdown wiki using Visual Studio Code.

You can get the extension by:

- [Clicking here](https://marketplace.visualstudio.com/items?itemName=paulzakinazure.markdown-wiki)
- Searching `markdown-wiki` in the Extensions Tab of Visual Studio Code.

## Features

### Analyze readability

If the sentence in a **Markdown** file is greater than 11 words, flag it with:

- **Warning**: "Hard to read" if the `ARI` score >= 10 and < 14.
- **Error**: "Very hard to read" if the `ARI` score >= 14.
- **Error**: If the sentence is longer than 25 words.

> ARI stands for [automated readability index](https://en.wikipedia.org/wiki/Automated_readability_index).

Here's how I chose these benchmarks:

- [Readable.com](https://readable.com/blog/what-is-the-average-persons-reading-level/) found the **average** reader can only comprehend text at an 8th grade level. This is an ARI score of < 10.

- [Gov.UK](https://insidegovuk.blog.gov.uk/2014/08/04/sentence-length-why-25-words-is-our-limit/) found any sentence with eleven words or fewer is easy to read. By contrast, any sentence with more than 25 is very hard to read.

### Manage footnotes

Managing Markdown footnotes **is a pain**. Use these commands to automate that task away!

Disclaimer: These commands, while convenient, make changes to your files. Thus, have a backup before executing these commands.

- `insertFootnote`: Insert a `url` on your clipboard as a Markdown footnote.

> Keyboard shortcut: `crtl + '` or `cmd + '` depending on your operating system.

- `reorderFootnotesInFile`: Reorder all the footnotes in a file.

> Keyboard shortcut: `ctrl+shift+'` or `cmd+shift+'` depending on your operating system.

- `reorderFootnotesInWorkspace`: Reorder all the footnotes in all the Markdown files in your workspace.

> Keyboard shortcut: `ctrl+alt+'`.
