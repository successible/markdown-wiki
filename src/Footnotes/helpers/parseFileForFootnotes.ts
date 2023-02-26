import * as fs from 'fs'
import { difference } from 'set-operations'
import * as vscode from 'vscode'
import { endnoteRegex, footnoteRegex } from './reorderFootnotesInFile'

export const parseFileForFootnotes = (file: string) => {
  // Using regex to parse the footnotes and the endnotes
  // Look for missing footnotes and endnotes.

  const contents = String(fs.readFileSync(file))
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

  const missingFootnotes = difference(footnotes, endnotes)
  if (
    (Array.isArray(missingFootnotes) && missingFootnotes.length > 0) ||
    (missingFootnotes instanceof Set && missingFootnotes.size)
  ) {
    const message = 'Unmatched footnotes'
    const error = `${message}: ${Array.from(missingFootnotes).join(' ')}`
    vscode.window.showErrorMessage(error)
    return null
  }

  const missingEndnotes = difference(endnotes, footnotes)
  if (
    (Array.isArray(missingEndnotes) && missingEndnotes.length > 0) ||
    (missingEndnotes instanceof Set && missingEndnotes.size)
  ) {
    const message = 'Unmatched endnotes'
    const error = `${message}: ${Array.from(missingEndnotes).join(' ')}`
    vscode.window.showErrorMessage(error)
    return null
  }

  return { contents, endnotes, footnotes, urls }
}
