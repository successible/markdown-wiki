import * as fs from 'node:fs'
import { difference } from 'set-operations'
import * as vscode from 'vscode'
import { error } from '../../Analytics'

export const footnoteRegex = /(\[\^\w+\])(?!(: ))/g
export const endnoteRegex = /(\[\^\w+\]): (.*)/g

export const auditFootnotesInFile = async (filePath: string) => {
  // Using regex to parse the footnotes and the endnotes
  // Look for missing footnotes and endnotes.

  const diagnostics: vscode.Diagnostic[] = []
  const contents = String(fs.readFileSync(filePath))
  const footnotes = []
  for (const match of contents.matchAll(footnoteRegex)) {
    const footnote = match[1]
    footnotes.push(footnote)
  }

  const endnotes = []
  const urls: Record<string, string> = {}
  for (const match of contents.matchAll(endnoteRegex)) {
    const endnote = match[1]
    const url = match[2]
    endnotes.push(endnote)
    urls[endnote] = url
  }

  const createDiagnostics = (message: string) => {
    const diagnostic = new vscode.Diagnostic(
      new vscode.Range(0, 0, 0, 0),
      message,
      error
    )
    diagnostic.code = 'footnote'
    diagnostics.push(diagnostic)
  }

  const missingFootnotes = difference(footnotes, endnotes)
  if (
    (Array.isArray(missingFootnotes) && missingFootnotes.length > 0) ||
    (missingFootnotes instanceof Set && missingFootnotes.size)
  ) {
    for (const missingFootnote of Array.from(missingFootnotes)) {
      const error = `Unmatched footnotes: ${missingFootnote}`
      createDiagnostics(error)
    }
  }

  const missingEndnotes = difference(endnotes, footnotes)
  if (
    (Array.isArray(missingEndnotes) && missingEndnotes.length > 0) ||
    (missingEndnotes instanceof Set && missingEndnotes.size)
  ) {
    for (const missingEndnote of Array.from(missingEndnotes)) {
      const error = `Unmatched endnote: ${missingEndnote}`
      createDiagnostics(error)
    }
  }

  return { contents, diagnostics, endnotes, footnotes, urls }
}
