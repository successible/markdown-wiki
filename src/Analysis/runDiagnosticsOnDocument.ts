import { split } from 'sentence-splitter'
import * as vscode from 'vscode'
import { getProselintDiagnostics } from './getProselintDiagnostics'
import { runDiagnosticsOnSentence } from './runDiagnosticsOnSentence'

export type Findings = [string, vscode.DiagnosticSeverity, string][]
export const READABILITY = 'readability'
export const JOBLINT = 'joblint'
export const WRITEGOOD = 'write-good'

export const runDiagnosticsOnDocument = async (
  document: vscode.TextDocument,
  options: { enableProselint: boolean } = { enableProselint: true }
): Promise<vscode.Diagnostic[]> => {
  const { enableProselint } = options
  const diagnostics: vscode.Diagnostic[] = []
  const config = vscode.workspace.getConfiguration('Markdown Wiki')

  if (enableProselint && config.get('proselint')) {
    diagnostics.push(...(await getProselintDiagnostics(document)))
  }

  // Loop through every line in the text
  let enableLint = true
  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    // Any amount of text WITHOUT a \n character (new line) is treated as one line
    // Word Wrap will make a long line of text look like a paragraph.
    // Hence, to avoid confusion, I call a line of text a paragraph.
    const paragraph = document.lineAt(lineIndex)
    const sentences = split(paragraph.text)
    const quote = paragraph.text.startsWith('> Quote:')
    sentences.forEach((sentence) => {
      // Don't lint the contents of a ```code``` block
      // When you see a ```, disable linting until you see the closing ```
      // That ensures you skip the body of the code block
      const codeBlock = sentence.raw.startsWith('```')
      // Start of code block or quote
      if (enableLint && (codeBlock || quote)) {
        enableLint = false
        return
        // End of the code block.
      } else if (!enableLint && codeBlock) {
        enableLint = true
        return
      } else {
        if (enableLint === true) {
          // For each sentence, analyze the markdown-wiki.
          // If an unreadable sentence is found, create a diagnostic.
          // Diagnostics are messages you see in the editor and Problem panel.
          const findings = runDiagnosticsOnSentence(
            document,
            paragraph,
            sentence.raw,
            lineIndex
          )
          findings?.forEach((f) => diagnostics.push(f))
        }
      }
    })
    // Because the quote is only one line, which need to enabling linting again
    if (quote) {
      enableLint = true
    }
  }
  return diagnostics
}
