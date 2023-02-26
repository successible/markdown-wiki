import { error, info } from '..'
import urlRegex from 'url-regex'
import * as vscode from 'vscode'
import { getJoblintDiagnostics } from './getJoblintDiagnostics'
import { getWriteGoodDiagnostics } from './getWriteGoodDiagnostics'
import { removeMarkdown } from './removeMarkdown'
import { READABILITY } from './runDiagnosticsOnDocument'

// Library to analyze the markdown-wiki of text
const rs = require('text-readability')

// Count the number of words in a string
const count = require('wordcount')

export type Findings = [string, vscode.DiagnosticSeverity, string][]

export const runDiagnosticsOnSentence = (
  document: vscode.TextDocument,
  paragraph: vscode.TextLine,
  sentence: string,
  lineIndex: number
): vscode.Diagnostic[] | null => {
  const config = vscode.workspace.getConfiguration('Markdown Wiki')

  const sentenceStart = paragraph.text.indexOf(sentence)
  const sentenceEnd = sentenceStart + sentence.length

  // We must analyze markdown-wiki only on plaintext, otherwise stuff like [links](really-long-url.com)
  // Will artificially inflate the readability score.
  const plainText = String(removeMarkdown(sentence)).replace(urlRegex(), '')
  const score = Number(rs.automatedReadabilityIndex(plainText))
  const nWords = count(plainText)
  const range = new vscode.Range(
    lineIndex,
    sentenceStart,
    lineIndex,
    sentenceEnd
  )

  const findings = [] as Findings

  // Collect the findings

  if (Boolean(config.get('joblint'))) {
    findings.push(...getJoblintDiagnostics(sentence))
  }

  if (Boolean(config.get('Write Good'))) {
    findings.push(...getWriteGoodDiagnostics(sentence))
  }

  if (nWords > 25) {
    findings.push(['This sentence is more than 25 words', error, READABILITY])
  }

  if (score >= 10 && sentenceStart !== -1 && nWords > 11) {
    const isVeryHard = score >= 14
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
  } else {
    return null
  }
}
