import { error } from '..'
import { type Findings, WRITEGOOD } from './analyzeDocument'

// Naive linter for English prose for developers
const writeGood = require('write-good')

export const getWriteGoodDiagnostics = (sentence: string): Findings => {
  const findings: Findings = []
  const results: [{ reason: string }] = writeGood(sentence)

  if (results.length >= 1) {
    for (const result of results) {
      findings.push([`${result.reason}`, error, WRITEGOOD])
    }
  }
  return findings
}
