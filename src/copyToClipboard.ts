import type {Context} from './renderPrompt.js'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {makeContext} from 'src/makeContext.js'

import {outputChannel} from './outputChannel.js'
import {renderPrompt} from './renderPrompt.js'

export const copyPromptToClipboard = async (prompt: string, context: Context) => {
  await vscode.env.clipboard.writeText(prompt)
  const logMessageTemplate = 'Copied {{#if hasMultiple}}{{items.length}} items{{else}}{{#if items.[0].language.title}}{{items.[0].language.title}} code{{else}}text{{/if}}{{/if}} for AI chat ({{prompt.length}} total characters).'
  const logMessage = renderHandlebars(logMessageTemplate, {
    ...context,
    prompt,
  })
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const showNotifications = config.get<boolean>('showNotifications')
  outputChannel.appendLine(logMessage)
  if (showNotifications) {
    vscode.window.showInformationMessage(logMessage)
  }
}

export const copyEditorToClipboard = async (editor?: vscode.TextEditor) => {
  const selectedEditor = editor ?? vscode.window.activeTextEditor
  if (!selectedEditor) {
    vscode.window.showErrorMessage('No active editor found')
    return
  }
  const item = {editor: selectedEditor}
  const context = await makeContext(item)
  const prompt = await renderPrompt(context)
  await copyPromptToClipboard(prompt, context)
}

export const copyUriToClipboard = async (uri: vscode.Uri) => {
  // TODO
}
