// Reference: https://github.com/microsoft/vscode-extension-samples/blob/main/code-actions-sample/src/diagnostics.ts
import { split } from 'sentence-splitter'
import * as vscode from 'vscode'

// Library to analyze the readability of text
const rs = require('text-readability')
// Library to convert Markdown to plain-text
const removeMd = require('remove-markdown')
// Count the number of words in a string
const count = require('wordcount')
// Regex to detect URL
const urlRegex = require('url-regex')

export const createDiagnostic = (
  document: vscode.TextDocument,
  paragraph: vscode.TextLine,
  sentence: string,
  lineIndex: number
): vscode.Diagnostic | null => {
  const error = vscode.DiagnosticSeverity.Error
  const info = vscode.DiagnosticSeverity.Information

  // We must analyze readability only on plaintext, otherwise stuff like [links](really-long-url.com)
  // Will artificially inflate the readability score.
  // We must also remove all URLs AFTER the markdown is stripped
  // As remove-markdown doesn't recognize footnotes. Thus, it leaves the URLs in the document.
  const plainText = String(removeMd(sentence)).replace(urlRegex(), '')
  const score = Number(rs.automatedReadabilityIndex(plainText))
  const sentenceStart = paragraph.text.indexOf(sentence)
  const nWords = count(plainText)
  if (score >= 10 && sentenceStart !== -1 && nWords > 11) {
    const sentenceEnd = sentenceStart + sentence.length
    const range = new vscode.Range(
      lineIndex,
      sentenceStart,
      lineIndex,
      sentenceEnd
    )

    if (nWords > 25) {
      const diagnostic = new vscode.Diagnostic(
        range,
        'This sentence is more than 25 words.',
        error
      )
      diagnostic.code = 'length'
      return diagnostic
    }

    const isVeryHard = score >= 14
    const message = isVeryHard
      ? 'This sentence is very hard to read.'
      : 'This sentence is hard to read.'
    const severity = isVeryHard ? error : info
    const diagnostic = new vscode.Diagnostic(range, message, severity)
    diagnostic.code = 'readability'
    return diagnostic
  } else {
    return null
  }
}

export const refreshDiagnostics = (
  document: vscode.TextDocument,
  diagnosticCollection: vscode.DiagnosticCollection
): void => {
  const diagnostics: vscode.Diagnostic[] = []
  // Loop through every line in the text
  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    // Any amount of text WITHOUT a \n character (new line) is treated as one line
    // Word Wrap will make a long line of text look like a paragraph.
    // Hence, to avoid confusion, I call a line of text a paragraph.
    const paragraph = document.lineAt(lineIndex)
    const sentences = split(paragraph.text)
    sentences.forEach((sentence) => {
      // For each sentence, analyze the readability.
      // If an unreadable sentence is found, create a diagnostic.
      // Diagnostics are those underlined messages you see in the editor and Problem panel.
      const diagnostic = createDiagnostic(
        document,
        paragraph,
        sentence.raw,
        lineIndex
      )
      diagnostic && diagnostics.push(diagnostic)
    })
  }
  diagnosticCollection.set(document.uri, diagnostics)
}

// context.subscriptions = How you register event handlers in VSCode
// These are the event handlers you need to handle text changes.

export const subscribeToDocumentChanges = (
  context: vscode.ExtensionContext,
  diagnosticCollection: vscode.DiagnosticCollection
): void => {
  if (vscode.window.activeTextEditor) {
    refreshDiagnostics(
      vscode.window.activeTextEditor.document,
      diagnosticCollection
    )
  }
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) {
        refreshDiagnostics(editor.document, diagnosticCollection)
      }
    })
  )
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) =>
      refreshDiagnostics(e.document, diagnosticCollection)
    )
  )
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) =>
      diagnosticCollection.delete(document.uri)
    )
  )
}
