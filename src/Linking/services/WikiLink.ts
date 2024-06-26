import type * as vscode from 'vscode'

export class WikiLink implements vscode.DocumentLinkProvider {
  context: vscode.ExtensionContext
  constructor(context: vscode.ExtensionContext) {
    this.context = context
  }

  // The provider returns the number of links to be added on the page
  // The links are created in analyzeDocument and stored in the cache there
  // That way, we do not need to iterate through the document twice.
  public async provideDocumentLinks(document: vscode.TextDocument) {
    const links = await this.context.workspaceState.get('wikiLinks')
    return links as vscode.DocumentLink[]
  }
}
