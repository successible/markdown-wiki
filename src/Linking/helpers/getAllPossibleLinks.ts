import * as vscode from 'vscode'
import { getAllFilePaths } from '../../Analytics/helpers/getAllFilePaths'
import { generatePossibleName } from './generatePossibleName'

export type AllPossibleLinks = Record<string, vscode.Uri>

export const getAllPossibleLinks = async () => {
  const allPossibleLinks: AllPossibleLinks = {}
  const files = await getAllFilePaths()

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
