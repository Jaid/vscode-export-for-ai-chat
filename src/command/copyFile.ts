import * as vscode from 'vscode'

import {copyPromptToClipboard} from '../getChatPrompt.js'
import {type Context, renderPrompt} from '../renderPrompt.js'

export const copyFile = async (uri: vscode.Uri) => {
  try {
    const prompt = await renderPrompt({uri})
    const {workspaceFolders} = vscode.workspace
    const workspaceFolder = workspaceFolders?.[0]
    const workspaceName = workspaceFolder?.name ?? 'Unknown'
    const document = await vscode.workspace.openTextDocument(uri)
    const context: Context = {
      codeCloser: '```',
      codeOpener: '```',
      newline: '\n',
      blankLine: '\n\n',
      hasMultiple: false,
      items: [
        {
          code: document.getText(),
          languageId: document.languageId,
          isWholeFile: true,
          file: uri.fsPath,
          fileName: uri.path.split('/').pop(),
          fileRelative: workspaceFolder ? vscode.workspace.asRelativePath(uri, false) : undefined,
        },
      ],
      workspaceFolder: workspaceFolder?.uri.fsPath,
      workspaceFolderName: workspaceFolder?.name,
      workspaceName,
    }
    await copyPromptToClipboard(prompt, context)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error copying file:', error)
    vscode.window.showErrorMessage(`Failed to copy file: ${errorMessage}`)
  }
}
