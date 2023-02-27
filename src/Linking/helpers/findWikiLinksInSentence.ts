import { TxtNode } from '@textlint/ast-node-types'
import * as vscode from 'vscode'
import { info } from '../../Analytics'
import { AllPossibleLinks } from './getAllPossibleLinks'

export const findWikiLinksInSentence = (
  sentence: TxtNode,
  lineIndex: number,
  allPossibleLinks: AllPossibleLinks
) => {
  const links: vscode.DocumentLink[] = []
  const missingLinks: vscode.Diagnostic[] = []

  const matches = sentence.raw.matchAll(/\[\[([_A-Za-z\s\d-]*)\]\]/g)
  for (const match of matches) {
    const startOfSentence = sentence.range[0]
    const startOfMatch = Number(match.index) + 2
    const start = startOfSentence + startOfMatch
    const endOfMatch = match[0].length
    const end = start + endOfMatch - 4

    // With a given sentence, look for the [[link]]
    // If one is found, tell VS Code that at range corresponding to the interior of [[]]
    const range = new vscode.Range(lineIndex, start, lineIndex, end)
    const title = match[1].toLowerCase()

    const link =
      // Example: Catch almost everything
      allPossibleLinks[title] ||
      // Example: Catch VS Code when the file is called vscode.md
      allPossibleLinks[title.replaceAll(' ', '')] ||
      // Example: Catch blue-green deploys with the file is called blue-green-deploys.md
      allPossibleLinks[title.replaceAll('-', ' ')]

    if (link) {
      links.push(new vscode.DocumentLink(range, link))
    } else {
      const message = 'This file does not exist'
      missingLinks.push(new vscode.Diagnostic(range, message, info))
    }
  }
  return { links, missingLinks }
}
