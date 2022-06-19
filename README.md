# Readability

Visual Studio Code extension that analyzes the readability of each sentence. Readability works on Markdown files.

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