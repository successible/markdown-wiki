import { TxtNode } from '@textlint/ast-node-types'
import { split } from 'sentence-splitter'
import * as vscode from 'vscode'
import { auditFootnotesInFile } from '../../Footnotes/helpers/auditFootnotesInFile'
import { findAssetLinksInSentence } from '../../Linking/helpers/findIAssetLinksInSentence'
import { findWikiLinksInSentence } from '../../Linking/helpers/findWikiLinksInSentence'
import { getAllPossibleLinks } from '../../Linking/helpers/getAllPossibleLinks'
import { analyzeSentence } from './analyzeSentence'
import { getConfig } from './getConfig'
import { getProselintDiagnostics } from './getProselintDiagnostics'

export type Findings = [string, vscode.DiagnosticSeverity, string][]
export const READABILITY = 'readability'
export const JOBLINT = 'joblint'
export const WRITEGOOD = 'write-good'

export const analyzeDocument = async (
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  options: { enableProselint: boolean } = { enableProselint: true }
) => {
  const { enableProselint } = options
  const diagnostics: vscode.Diagnostic[] = []
  const config = getConfig()
  const proselint = config.get('proselint')

  diagnostics.push(...(await auditFootnotesInFile(document.fileName)))

  if (enableProselint && proselint) {
    diagnostics.push(...(await getProselintDiagnostics(document)))
  }

  const allPossibleLinks = await getAllPossibleLinks()
  const wikiLinks: vscode.DocumentLink[] = []
  const assetLinks: string[] = []

  let enableLint = true
  // Loop through every line in the text
  // Any amount of text WITHOUT a \n character (new line) is treated as one line
  // Word Wrap will make a long line of text look like a paragraph.
  // Hence, to avoid confusion, I call a line of text a paragraph.
  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    const paragraph = document.lineAt(lineIndex)
    const quote = paragraph.text.startsWith('> Quote:')
    const sentences = split(paragraph.text)
    for (const sentence of sentences) {
      // Find all the wiki links
      const wikiLinkResults = findWikiLinksInSentence(
        sentence as TxtNode,
        lineIndex,
        allPossibleLinks
      )
      diagnostics.push(...wikiLinkResults.missingLinks)
      wikiLinks.push(...wikiLinkResults.links)

      // Find all the missing asset links
      const assetLinkResults = await findAssetLinksInSentence(
        sentence as TxtNode,
        lineIndex
      )
      diagnostics.push(...assetLinkResults.missingLinks)
      assetLinks.push(...assetLinkResults.links)

      // Don't lint the contents of a ```code``` block
      // When you see a ```, disable linting until you see the closing ```
      // That ensures you skip the body of the code block
      const codeBlock = sentence.raw.startsWith('```')
      // Start of code block or quote
      if (enableLint && (codeBlock || quote)) {
        enableLint = false
        continue
        // End of the code block.
      } else if (!enableLint && codeBlock) {
        enableLint = true
        continue
      } else {
        if (enableLint === true) {
          // For each sentence, analyze the markdown-wiki.
          // If an unreadable sentence is found, create a diagnostic.
          // Diagnostics are messages you see in the editor and Problem panel.
          const findings = analyzeSentence(
            document,
            paragraph,
            sentence.raw,
            lineIndex
          )
          findings?.forEach((f) => diagnostics.push(f))
        }
      }
    }

    // Because the quote is only one line, which need to enabling linting again
    if (quote) {
      enableLint = true
    }
  }

  await context.workspaceState.update('wikiLinks', wikiLinks)

  return { assetLinks, diagnostics }
}
