import urlRegex from 'url-regex-safe'
import * as vscode from 'vscode'
import { error, info } from '..'
import { READABILITY } from './analyzeDocument'
import { getConfig } from './getConfig'
import { getWriteGoodDiagnostics } from './getWriteGoodDiagnostics'
import { removeMarkdown } from './removeMarkdown'

export type Findings = [string, vscode.DiagnosticSeverity, string][]

export const analyzeSentence = (
  document: vscode.TextDocument,
  paragraph: vscode.TextLine,
  sentence: string,
  lineIndex: number
): vscode.Diagnostic[] | null => {
  const sentenceStart = paragraph.text.indexOf(sentence)
  const sentenceEnd = sentenceStart + sentence.length

  // We must analyze markdown-wiki only on plaintext, otherwise stuff like [links](really-long-url.com)
  // Will artificially inflate the readability score.
  const plainText = String(removeMarkdown(sentence)).replace(urlRegex(), '')

  const nCharacters = plainText.replace(/ /g, '').length || 1
  const nWords = plainText.trim().split(/\s+/).length || 1
  const sentences = 1 // We apply ARI only to individual sentences
  const averageCharacterPerWord = nCharacters / nWords
  const averageWordPerSentence = nWords / sentences

  // ARI: https://en.wikipedia.org/wiki/Automated_readability_index
  const ARI =
    4.71 * averageCharacterPerWord + 0.5 * averageWordPerSentence - 21.43

  const range = new vscode.Range(
    lineIndex,
    sentenceStart,
    lineIndex,
    sentenceEnd
  )

  const findings = [] as Findings

  // Collect the findings

  const config = getConfig()
  const readability = Boolean(config.get('Readability'))
  const writeGood = Boolean(config.get('Write Good'))

  if (writeGood) {
    findings.push(...getWriteGoodDiagnostics(sentence))
  }

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
    return findings.flatMap((finding) => {
      const [message, severity, code] = finding
      const diagnostic = new vscode.Diagnostic(range, message, severity)
      diagnostic.code = code
      return diagnostic
    })
  }
  return null
}
