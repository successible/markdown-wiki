// Reference: https://github.com/microsoft/vscode-extension-samples/tree/main/custom-editor-sample

import path from 'path'
import * as vscode from 'vscode'
import { getNonce } from '../helpers/getNonce'

export class Editor implements vscode.CustomTextEditorProvider {
  private static readonly viewType = 'markdown-wiki.Editor'
  constructor(private readonly context: vscode.ExtensionContext) {}

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new Editor(context)
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      Editor.viewType,
      provider
    )
    return providerRegistration
  }

  // Called when the Editor is opened.
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel
  ) {
    webviewPanel.webview.options = {
      enableScripts: true,
    }
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview)

    // This function is how we transmit text from VS Code to the webview
    function updateWebview() {
      webviewPanel.webview.postMessage({
        text: document.getText(),
        type: 'update',
      })
    }

    // Fire the update event whenever the text changes in VS Code
    const subscription = vscode.workspace.onDidChangeTextDocument((e) => {
      const shouldUpdate = e.document.uri.toString() === document.uri.toString()
      if (shouldUpdate) {
        updateWebview()
      }
    })

    // Make sure we get rid of onDidChangeTextDocument when the editor is closed.
    webviewPanel.onDidDispose(() => {
      subscription.dispose()
    })

    // This is where we can receive any arbitrary event from the webview
    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case 'text': {
          // This is the new text from the textarea in the webview
          console.log(e.text)
          return
        }
      }
    })

    // We should update the webview with the text from VS Code when the webview first opens
    updateWebview()
  }

  // Get the HTML used for the webview.
  private getHtmlForWebview(webview: vscode.Webview): string {
    const extensionPath = this.context.extensionPath
    // Load the single stylesheet and script file we use for the webview
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.parse(path.join(extensionPath, 'media', 'editor.js'))
    )
    const styleUri = webview.asWebviewUri(
      vscode.Uri.parse(path.join(extensionPath, 'media', 'editor.css'))
    )

    // Use a nonce to whitelist which scripts can be run via CSP
    const nonce = getNonce()

    return `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleUri}" rel="stylesheet" />
				<title>Editor</title>
			</head>
			<body>
        <textarea id="editor"></textarea>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`
  }
}
