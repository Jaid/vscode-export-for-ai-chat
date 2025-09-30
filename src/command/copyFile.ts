import * as vscode from 'vscode'

import {getChatPromptFromText} from 'src/getChatPrompt.js'

export const copyFile = async (uri: vscode.Uri) => {
  try {
    const document = await vscode.workspace.openTextDocument(uri)
    const text = document.getText()
    const {languageId} = document
    await getChatPromptFromText(text, {
      isWholeFile: true,
      languageId,
      copyToClipboard: true,
    })
  } catch (error) {
    console.error('Error copying file:', error)
    vscode.window.showErrorMessage(`Failed to copy file: ${error.message}`)
  }
}
