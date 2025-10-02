import * as vscode from 'vscode'

import {copyCode} from 'src/command/copyCode.js'
import {copyFile} from 'src/command/copyFile.js'

export const activate = (context: vscode.ExtensionContext) => {
  const copyCodeDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyCode', copyCode)
  const copyFileDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyFile', copyFile)
  context.subscriptions.push(copyCodeDisposable, copyFileDisposable)
}
