import * as vscode from 'vscode'

export const getConfig = () =>
  vscode.workspace.getConfiguration('Markdown Wiki')
