import { globSync } from 'glob'
import * as vscode from 'vscode'

export const getAllFilePaths = async (
  customGlob = '**/*.md'
): Promise<string[]> => {
  const open = vscode.workspace.openTextDocument

  const folders = vscode.workspace.workspaceFolders
  if (!folders) {
    return []
  }

  let toIgnore = [] as string[]
  try {
    // If the workspace has a .gitignore in the root, use it exclude the paths to glob through
    const path = globSync(`${folders[0].uri.path}/.gitignore`, {})[0]
    const gitignore = await open(vscode.Uri.file(path))
    toIgnore = gitignore.getText().split('\n') as string[]
  } catch (e) {}

  const paths = globSync(`${folders[0].uri.path}/${customGlob}`, {})
    // Do not grab any markdown file that has been gitignored
    .filter((p) => toIgnore.filter((i) => p.includes(i)).length === 0)

  return paths
}
