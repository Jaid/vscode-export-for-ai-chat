import * as vscode from 'vscode'

import {copyToClipboard} from 'src/command/copyToClipboard.js'

export const activate = (context: vscode.ExtensionContext) => {
  const copyToClipboardDisposable = vscode.commands.registerCommand('export-for-ai-chat.copyToClipboard', copyToClipboard)
  context.subscriptions.push(copyToClipboardDisposable)
}
