import * as vscode from 'vscode'

import {copyCode} from './command/copyCode.js'

export const activate = (context: vscode.ExtensionContext) => {
  const disposable = vscode.commands.registerCommand(`export-for-ai-chat.copyCode`, copyCode)
  context.subscriptions.push(disposable)
}
