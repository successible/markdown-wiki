import { execSync } from 'node:child_process'
import type { TxtNode } from '@textlint/ast-node-types'
import { split } from 'sentence-splitter'
import * as vscode from 'vscode'
import { auditFootnotesInFile } from '../../Footnotes/helpers/auditFootnotesInFile'
import { findWikiLinksInSentence } from '../../Linking/helpers/findWikiLinksInSentence'
import { getAllPossibleLinks } from '../../Linking/helpers/getAllPossibleLinks'
import { analyzeSentence } from './analyzeSentence'

export type Findings = [string, vscode.DiagnosticSeverity, string][]
export const READABILITY = 'readability'
export type DocumentMode =
  | 'onDidLoadTextDocument'
  | 'onDidChangeTextDocument'
  | 'onDidSaveTextDocument'
  | 'onDidChangeActiveTextEditor'

export const analyzeDocument = async (
  _context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  mode: DocumentMode,
  statusBar: vscode.StatusBarItem | null
) => {
  const diagnostics: vscode.Diagnostic[] = []
  diagnostics.push(
    ...(await auditFootnotesInFile(document.fileName)).diagnostics
  )

  const allPossibleLinks =
    mode !== 'onDidChangeTextDocument' ? await getAllPossibleLinks() : {}

  let enableLint = true
  // Loop through every line in the text
  // Any amount of text WITHOUT a \n character (new line) is treated as one line
  // Word Wrap will make a long line of text look like a paragraph.
  // Hence, to avoid confusion, I call a line of text a paragraph.

  const analysis = {
    raw: [] as { sentence: string; range: vscode.Range }[],
    sentences: [] as string[],
  }

  for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
    const paragraph = document.lineAt(lineIndex)
    const quote = paragraph.text.startsWith('> Quote:')
    const sentences = split(paragraph.text)
    const isFootnote = paragraph.text.startsWith('[^')
    for (const sentence of sentences) {
      // Find all the wiki links
      if (mode !== 'onDidChangeTextDocument') {
        const wikiLinkResults = findWikiLinksInSentence(
          sentence as TxtNode,
          lineIndex,
          allPossibleLinks
        )
        diagnostics.push(...wikiLinkResults.missingLinks)
      }
      // Don't lint the contents of a ```code``` block
      // When you see a ```, disable linting until you see the closing ```
      // That ensures you skip the body of the code block
      const codeBlock = sentence.raw.startsWith('```')
      // Start of code block or quote
      if (enableLint && (codeBlock || quote)) {
        enableLint = false
        // End of the code block.
      } else if (!enableLint && codeBlock) {
        enableLint = true
      } else {
        if (enableLint === true) {
          const sentenceStart = paragraph.text.indexOf(sentence.raw)
          const sentenceEnd = sentenceStart + sentence.raw.length
          const range = new vscode.Range(
            lineIndex,
            sentenceStart,
            lineIndex,
            sentenceEnd
          )

          // For each sentence, analyze the markdown-wiki.
          // If an unreadable sentence is found, create a diagnostic.
          // Diagnostics are messages you see in the editor and Problem panel.
          const result = analyzeSentence(
            document,
            sentence.raw,
            sentenceStart,
            range
          )
          result.diagnostics?.forEach((f) => diagnostics.push(f))
          analysis.sentences.push(result.sentence)
          if (!isFootnote) {
            analysis.raw.push({ sentence: sentence.raw, range })
          }
        }
      }
    }

    // Because the quote is only one line, which need to enabling linting again
    if (quote) {
      enableLint = true
    }
  }

  const sentencesToCount = analysis.sentences
    .filter(Boolean)
    .filter((s) => s !== ' ' && !s.includes('title:'))
  const wordsToCount = sentencesToCount.flatMap((s) => s.split(' '))

  if (statusBar) {
    statusBar.text = `Words: ${wordsToCount.length}`
    statusBar.tooltip = `Sentences: ${sentencesToCount.length}`
    statusBar.show()
  }

  // Check if LanguageTool exists
  const languageTool = execSync('which languagetool', {
    encoding: 'utf-8',
  }).toString()
  // Run LanguageTool on the entire block on the entire file
  // But only if it exists!
  if (languageTool.includes('bin/languagetool')) {
    const url = 'http://localhost:8081/v2/check'
    const text = analysis.raw
      .filter((raw) => {
        const s = raw.sentence
        const useSentence = s && s !== ' ' && !s.startsWith('title:')
        return useSentence
      })
      .map((s) => s.sentence)
      .join('\n')

    const params = new URLSearchParams()
    params.append('language', 'en-US')
    params.append('format', 'markdown')
    params.append('text', text)
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
      if (!response.ok) {
        vscode.window.showErrorMessage(
          `Something went wrong with the LanguageTool Server ${response.status}, ${response.statusText}`
        )
      } else {
        const result = (await response.json()) as {
          matches: { message: string; shortMessage: string; sentence: string }[]
        }
        result.matches
          .filter((m) => m.shortMessage !== 'Spelling mistake')
          .map((m) => {
            const match = analysis.raw.find((raw) => {
              return raw.sentence === m.sentence
            })
            const diagnostic = new vscode.Diagnostic(
              match ? match.range : new vscode.Range(0, 0, 0, 0),
              `Message: ${m.message}\nSentence:\n${m.sentence}`,
              vscode.DiagnosticSeverity.Error
            )
            diagnostic.code = 'grammar'
            diagnostics.push(diagnostic)
          })
      }
    } catch (e) {
      vscode.window.showErrorMessage(
        `Something went wrong! Are you sure your LanguageTool server running on ${url}? Error: ${e}`
      )
    }
  }

  return { diagnostics }
}
