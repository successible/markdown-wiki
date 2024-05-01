import type * as vscode from 'vscode'

export const isMarkdownFile = (uri: vscode.Uri) => {
  return String(uri).endsWith('.md') || String(uri).endsWith('mdx')
}
