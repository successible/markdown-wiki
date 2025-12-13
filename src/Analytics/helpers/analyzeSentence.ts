import * as vscode from 'vscode'
import { error, info } from '..'
import { READABILITY } from './analyzeDocument'
import { getConfig } from './getConfig'
import { removeMarkdown } from './removeMarkdown'

export type Findings = [string, vscode.DiagnosticSeverity, string][]

// Source: https://urlregex.com/index.html
export const URLRegex =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/

export const analyzeSentence = (
  _document: vscode.TextDocument,
  sentence: string,
  sentenceStart: number,
  range: vscode.Range
): { sentence: string; diagnostics: vscode.Diagnostic[] } => {
  // We must analyze markdown-wiki only on plaintext, otherwise stuff like [links](really-long-url.com)
  // Will artificially inflate the readability score.
  const plainText = String(removeMarkdown(sentence)).replace(URLRegex, '')

  const nCharacters = plainText.replace(/ /g, '').length || 1
  const nWords = plainText.trim().split(/\s+/).length || 1
  const sentences = 1 // We apply ARI only to individual sentences
  const averageCharacterPerWord = nCharacters / nWords
  const averageWordPerSentence = nWords / sentences

  // ARI: https://en.wikipedia.org/wiki/Automated_readability_index
  const ARI =
    4.71 * averageCharacterPerWord + 0.5 * averageWordPerSentence - 21.43

  const findings = [] as Findings

  // Collect the findings

  const config = getConfig()
  const readability = Boolean(config.get('Readability'))

  if (nWords > 25 && readability) {
    findings.push(['This sentence is more than 25 words', error, READABILITY])
  }

  if (ARI >= 10 && sentenceStart !== -1 && nWords > 11 && readability) {
    const isVeryHard = ARI >= 14
    const message = isVeryHard
      ? 'This sentence is very hard to read.'
      : 'This sentence is hard to read.'
    const severity = isVeryHard ? error : info
    findings.push([message, severity, READABILITY])
  }

  // Assemble the findings into vscode.Diagnostics

  if (findings.length >= 1) {
    const diagnostics = findings.flatMap((finding) => {
      const [message, severity, code] = finding
      const diagnostic = new vscode.Diagnostic(range, message, severity)
      diagnostic.code = code
      return diagnostic
    })
    return { sentence: plainText, diagnostics }
  }
  return { sentence: plainText, diagnostics: [] }
}
