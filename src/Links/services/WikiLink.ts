import { split } from 'sentence-splitter'
import * as vscode from 'vscode'
import { getAllPossibleWikiLinks } from '../helpers/getAllPossibleWikiLinks'

export class WikiLink implements vscode.DocumentLinkProvider {
  diagnostics: vscode.DiagnosticCollection
  constructor(diagnostics: vscode.DiagnosticCollection) {
    this.diagnostics = diagnostics
  }
  // Provider all the relevant [[wiki links]] in the given document
  public provideDocumentLinks(document: vscode.TextDocument) {
    const wikiLinks: vscode.DocumentLink[] = []
    const allPossibleWikiLinks = getAllPossibleWikiLinks()
    const missingLinkWarnings: vscode.Diagnostic[] = []
    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
      const paragraph = document.lineAt(lineIndex)
      const sentences = split(paragraph.text)
      sentences.forEach((sentence) => {
        const text = sentence.raw
        // The same regex in link.json
        const matches = text.matchAll(/\[\[([_A-Za-z\s\d-]*)\]\]/g)
        for (const match of matches) {
          const startOfSentence = sentence.range[0]
          const startOfMatch = Number(match.index) + 2
          const start = startOfSentence + startOfMatch
          const endOfMatch = match[0].length
          const end = start + endOfMatch - 4
          // With a given sentence, look for the [[link]]
          // If one is found, tell VS Code that at range corresponding to the interior of [[]]
          const range = new vscode.Range(lineIndex, start, lineIndex, end)
          const title = match[1].toLowerCase()

          const link =
            // Example: Catch almost everything
            allPossibleWikiLinks[title] ||
            // Example: Catch VS Code when the file is called vscode.md
            allPossibleWikiLinks[title.replaceAll(' ', '')] ||
            // Example: Catch blue-green deploys with the file is called blue-green-deploys.md
            allPossibleWikiLinks[title.replaceAll('-', ' ')]

          if (link) {
            wikiLinks.push(new vscode.DocumentLink(range, link))
          } else {
            missingLinkWarnings.push(
              new vscode.Diagnostic(
                range,
                'This file does not exist',
                vscode.DiagnosticSeverity.Information
              )
            )
          }
        }
      })
    }
    this.diagnostics.set(document.uri, missingLinkWarnings)
    return wikiLinks
  }
}
