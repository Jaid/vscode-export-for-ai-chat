import type {Context} from './renderPrompt.js'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {outputChannel} from './outputChannel.js'
import {renderPrompt} from './renderPrompt.js'

const buildContext = async (items: Array<{editor?: vscode.TextEditor
  uri?: vscode.Uri}>): Promise<Context> => {
  const {workspaceFolders} = vscode.workspace
  const workspaceFolder = workspaceFolders?.[0]
  const workspaceName = workspaceFolder?.name ?? 'Unknown'
  return {
    blankLine: '\n\n',
    codeCloser: '```',
    codeOpener: '```',
    hasMultiple: items.length > 1,
    items: [],
    newline: '\n',
    workspaceFolder: workspaceFolder?.uri.fsPath,
    workspaceFolderName: workspaceFolder?.name,
    workspaceName,
  }
}

export const copyPromptToClipboard = async (prompt: string, context: Context) => {
  await vscode.env.clipboard.writeText(prompt)
  const logMessageTemplate = 'Copied {{#if hasMultiple}}{{items.length}} items{{else}}{{#if items.[0].language.title}}{{items.[0].language.title}} code{{else}}text{{/if}}{{/if}} for AI chat ({{prompt.length}} total characters).'
  const logMessage = renderHandlebars(logMessageTemplate, {
    ...context,
    prompt,
  })
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const showNotifications = config.get<boolean>('showNotifications')
  if (showNotifications) {
    // Don't await - let the notification show without blocking
    vscode.window.showInformationMessage(logMessage)
  }
  outputChannel.appendLine(logMessage)
}

export const getChatPromptFromEditor = async (editor?: vscode.TextEditor) => {
  const selectedEditor = editor ?? vscode.window.activeTextEditor
  if (!selectedEditor) {
    vscode.window.showErrorMessage('No active editor found')
    return
  }
  const prompt = await renderPrompt({editor: selectedEditor})
  const context = await buildContext([{editor: selectedEditor}])
  await copyPromptToClipboard(prompt, context)
}
