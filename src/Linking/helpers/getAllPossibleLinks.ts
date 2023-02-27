import glob from 'glob'
import * as vscode from 'vscode'
import { generatePossibleName } from './generatePossibleName'

export type AllPossibleLinks = Record<string, vscode.Uri>

export const getAllPossibleLinks = () => {
  // This is how you can read all files in the workspace
  const allPossibleLinks: AllPossibleLinks = {}
  const folders = vscode.workspace.workspaceFolders
  if (!folders) {
    return {} as AllPossibleLinks
  }
  const workspace = folders[0]
  const files = glob.sync(`${workspace.uri.path}/**/*.md`)
  files.forEach((path) => {
    const fileName = path
      .trim()
      .split('/')
      .slice(-1)[0]
      .replace('.md', '')
      .toLowerCase()

    const possibleNames = [
      ...generatePossibleName(fileName),
      ...generatePossibleName(fileName.replaceAll('-', ' ')),
      ...generatePossibleName(fileName.replaceAll('_', ' ')),
    ]
    possibleNames.map((name) => {
      const uri = vscode.Uri.parse(path)
      allPossibleLinks[name] = uri
    })
  })
  return allPossibleLinks
}
