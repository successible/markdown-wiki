import { execSync } from 'node:child_process'
import { isWebUri } from 'valid-url'
import * as vscode from 'vscode'
import { generateFootnoteText } from './generateFootnoteText'
import { orderFootnotesInFile } from './orderFootnotesInFile'

export const insertFootnoteInFile = async () => {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    // Throw an error if Pandoc does not exist
    const pandocExists = execSync('pandoc --help', {
      encoding: 'utf-8',
    }).toString()
    if (!pandocExists.includes('pandoc [OPTIONS] [FILES]')) {
      return vscode.window.showErrorMessage(
        'You must have pandoc installed to order insert footnotes and endnotes.'
      )
    }

    const url = await vscode.env.clipboard.readText()
    if (!isWebUri(url)) {
      const message = 'You must have a link copied to your clipboard!'
      return vscode.window.showErrorMessage(message)
    }
    const selection = editor.selection.active
    const edit = new vscode.WorkspaceEdit()
    const replacement = generateFootnoteText()
    edit.insert(editor.document.uri, selection, replacement)
    edit.insert(
      editor.document.uri,
      new vscode.Position(editor.document.lineCount, 0),
      `${replacement}: ${url}`
    )

    await vscode.workspace.applyEdit(edit)
    await editor.document.save()

    await orderFootnotesInFile(editor.document.fileName)
  }
}
