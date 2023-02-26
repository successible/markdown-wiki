import { isWebUri } from 'valid-url'
import * as vscode from 'vscode'
import { generateFootnoteText } from './generateFootnoteText'
import { reorderFootnotesInFile } from './reorderFootnotesInFile'

export const insertFootnoteInFile = async () => {
  const editor = vscode.window.activeTextEditor
  if (editor) {
    const url = await vscode.env.clipboard.readText()
    if (!isWebUri(url)) {
      const message = 'You must have a link copied to your clipboard!'
      return vscode.window.showErrorMessage(message)
    }
    const selection = editor.selection.active
    const cursor = editor.document.offsetAt(selection)
    if (cursor === 0) {
      const message = 'You must have your cursor in the document'
      return vscode.window.showErrorMessage(message)
    }

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
    reorderFootnotesInFile()
  }
}
