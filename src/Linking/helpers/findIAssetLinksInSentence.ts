import { TxtNode } from '@textlint/ast-node-types'
import fs from 'fs'
import * as vscode from 'vscode'
import { info } from '../../Analytics'

export const findAssetLinksInSentence = async (
  sentence: TxtNode,
  lineIndex: number
): Promise<{
  links: string[]
  missingLinks: vscode.Diagnostic[]
}> => {
  const links: string[] = []
  const missingLinks: vscode.Diagnostic[] = []
  // The shortest a line with an image can be is six characters
  // That is because an image in Markdown needs !, [], and ()
  const workspace = vscode.workspace.workspaceFolders
  if (sentence.raw.length <= 5 || !workspace) {
    return { links: [], missingLinks: [] }
  }

  const matches = sentence.raw.matchAll(/\[.*?]\((.*?)\)/g)
  for (const match of matches) {
    const name = String(match[1])
    // Ignore any link that is not local
    if (name.includes('http://') || name.includes('https://')) {
      return { links: [], missingLinks: [] }
    }

    const path = vscode.Uri.file(`${workspace[0].uri.path}${name}`).path
    const imageExists = fs.existsSync(path)
    if (!imageExists) {
      const startOfSentence = sentence.range[0]
      const startOfMatch = Number(match.index) + 2
      const start = startOfSentence + startOfMatch
      const endOfMatch = match[0].length
      const end = start + endOfMatch - 4
      const range = new vscode.Range(lineIndex, start, lineIndex, end)
      missingLinks.push(
        new vscode.Diagnostic(range, 'Image does not exist', info)
      )
    } else {
      links.push(path)
    }
  }
  return { links, missingLinks }
}
