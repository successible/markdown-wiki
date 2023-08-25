import * as vscode from 'vscode'
import { EXTENSION_NAME } from '../extension'
import { insertFootnoteInFile } from './helpers/insertFootnoteInFile'
import { orderFootnotesInFile } from './helpers/orderFootnotesInFile'

export const Footnotes = async (context: vscode.ExtensionContext) => {
  const commands = [
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.insertFootnote`,
      async () => await insertFootnoteInFile()
    ),
    vscode.commands.registerCommand(
      `${EXTENSION_NAME}.orderFootnotes`,
      async () => {
        const editor = vscode.window.activeTextEditor
        if (editor) {
          const fileName = editor.document.fileName
          await orderFootnotesInFile(fileName)
        }
      }
    ),
  ]

  context.subscriptions.push(...commands)
}
