import prettier from '@prettier/sync'
import * as fs from 'fs'
import * as vscode from 'vscode'
import { auditFootnotesInFile } from './auditFootnotesInFile'
import { generateFootnoteText } from './generateFootnoteText'

export const orderFootnotesInFile = async (filePath: string) => {
  const { contents, diagnostics, footnotes } =
    await auditFootnotesInFile(filePath)
  if (diagnostics.length >= 1) {
    return vscode.window.showErrorMessage(
      'You have missing or unmatched footnotes. Aborting operation.'
    )
  } else {
    let newContents = contents
    const placeholderFootnotes: string[] = []

    // We order footnotes when they are unique (as placeholders), not numbers to avoid uniqueness errors
    footnotes.forEach((footnote) => {
      const placeholderFootnote = generateFootnoteText()
      newContents = newContents.replaceAll(footnote, placeholderFootnote)
      placeholderFootnotes.push(placeholderFootnote)
    })
    placeholderFootnotes.forEach((footnote, i) => {
      newContents = newContents.replaceAll(footnote, `[^${i + 1}]`)
    })

    // Make sure the endnotes are bunched up in one block at the bottom
    const formattedContents = prettier.format(newContents, {
      parser: 'markdown',
    })

    fs.writeFileSync(filePath, formattedContents)
    vscode.window.showInformationMessage('Footnotes ordered!')
  }
}
