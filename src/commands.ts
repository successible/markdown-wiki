import * as vscode from 'vscode'
import {
  insertFootnote,
  reorderFootnotesInFile,
  reorderFootnotesInWorkspace,
} from './helpers/footnotes'

const register = vscode.commands.registerCommand

export const insertFootnoteCommand = register(
  'readability.insertFootnote',
  async () => await insertFootnote()
)

export const reorderFootnotesInFileCommand = register(
  'readability.reorderFootnotesInFile',
  async () => await reorderFootnotesInFile()
)

export const reorderFootnotesInWorkspaceCommand = register(
  'readability.reorderFootnotesInWorkspace',
  async () => await reorderFootnotesInWorkspace()
)
