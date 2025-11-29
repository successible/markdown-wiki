import { glob } from 'glob'
import ignore from 'ignore'
import * as vscode from 'vscode'

export const getAllFilePaths = async (
  customGlob = '**/*.md'
): Promise<string[]> => {
  const folders = vscode.workspace.workspaceFolders
  if (!folders) return []
  const root = folders[0].uri.fsPath

  // Load .gitignore if present
  const ig = ignore()
  try {
    const gitignorePath = `${root}/.gitignore`
    const doc = await vscode.workspace.openTextDocument(gitignorePath)
    ig.add(doc.getText())
  } catch (_) {
    // ignore if missing
  }

  const files = await glob(`${root}/${customGlob}`, { nodir: true })
  return files.filter((f) => !ig.ignores(f.replace(`${root}/`, '')))
}
