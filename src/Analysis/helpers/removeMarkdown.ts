import urlRegex from 'url-regex'
// Library to convert Markdown to plain-text
const removeMarkdownLib = require('remove-markdown')

export const removeMarkdown = (markdown: string) => {
  // We must also remove all URLs AFTER the markdown is stripped
  // As remove-markdown doesn't recognize footnotes. Instead, it just leaves URLs in the document.
  return String(removeMarkdownLib(markdown))
    .replace(urlRegex(), '')
    .replaceAll('[[', '')
    .replaceAll(']]', '')
    .replaceAll('\n:', '')
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
}
