/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-check

const manageEditor = () => {
  // @ts-ignore
  const vscode = acquireVsCodeApi()
  const editor = document.getElementById('editor')

  editor?.addEventListener('input', (e) => {
    vscode.postMessage({
      // @ts-ignore
      text: e.target.value,
      type: 'text',
    })
  })

  const updateContent = (text) => {
    if (editor) {
      editor.innerText = text
    }
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener('message', (event) => {
    const message = event.data // The json data that the extension sent
    switch (message.type) {
      case 'update':
        const text = message.text
        updateContent(text)
        // Do something to the HTML
        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ text })
        return
    }
  })

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState()
  if (state) {
    updateContent(state.text)
  }
}

manageEditor()
