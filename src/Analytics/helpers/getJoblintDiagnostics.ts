import { error } from '..'
import { JOBLINT } from './analyzeDocument'
import { Findings } from './analyzeSentence'

// Library to detect sexism, culture, expectations, and recruiter fails.
const joblint = require('joblint')

export const getJoblintDiagnostics = (sentence: string): Findings => {
  const findings: Findings = []
  const results: {
    issues: [
      {
        name: string // Short name for the rule that was triggered
        reason: string // A longer description of why this rule was triggered
        solution: string // A short description of how to solve this issue
      }
    ]
  } = joblint(sentence)

  if (results.issues.length >= 1) {
    for (const issue of results.issues) {
      findings.push([`${issue.reason} ${issue.solution}`, error, JOBLINT])
    }
  }
  return findings
}
