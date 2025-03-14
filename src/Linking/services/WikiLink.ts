import type { TxtNode } from '@textlint/ast-node-types'
import { split } from 'sentence-splitter'
import type * as vscode from 'vscode'
import { findWikiLinksInSentence } from '../helpers/findWikiLinksInSentence'
import { getAllPossibleLinks } from '../helpers/getAllPossibleLinks'

export class WikiLink implements vscode.DocumentLinkProvider {
  context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  async provideDocumentLinks(document: vscode.TextDocument) {
    const allPossibleLinks = await getAllPossibleLinks()
    const wikiLinks: vscode.DocumentLink[] = []
    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
      const paragraph = document.lineAt(lineIndex)
      const sentences = split(paragraph.text)
      for (const sentence of sentences) {
        // Find all the wiki links
        const wikiLinkResults = findWikiLinksInSentence(
          sentence as TxtNode,
          lineIndex,
          allPossibleLinks
        )
        wikiLinks.push(...wikiLinkResults.links)
      }
    }
    return wikiLinks as vscode.DocumentLink[]
  }
}
