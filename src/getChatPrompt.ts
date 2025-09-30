import type {Language} from './languageIds.js'
import type {InputOptions} from 'more-types'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {getLanguageFromLanguageId} from './languageIds.js'
import {outputChannel} from './outputChannel.js'

type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    languageId: string
  }
}>
type CopyOptions = InputOptions<{
  optionalOptions: {
    context: Context
  }
}>

const defaultOptions = {
  isWholeFile: false,
  copyToClipboard: true,
}

export const copyPrompt = async (prompt: string, options: CopyOptions['parameter'] = {}) => {
  const mergedOptions: CopyOptions['merged'] = {
    ...options,
  }
  await vscode.env.clipboard.writeText(prompt)
  const logMessageTemplate = 'Copied {{#if language.title}}{{language.title}} code{{else}}text{{/if}} for AI chat ({{#if code}}{{code.length}} code characters, {{/if}}{{prompt.length}} total characters).'
  const logMessage = renderHandlebars(logMessageTemplate, {
    ...mergedOptions.context,
    prompt,
  })
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const showNotifications = config.get<boolean>('showNotifications')
  if (showNotifications) {
    await vscode.window.showInformationMessage(logMessage)
  }
  outputChannel.appendLine(logMessage)
}

export const getChatPromptFromEditor = async (editor?: vscode.TextEditor, options: Options['parameter'] = {}) => {
  const selectedEditor = editor ?? vscode.window.activeTextEditor
  let text: string | undefined
  let {isWholeFile} = defaultOptions
  if (selectedEditor) {
    const {selection} = selectedEditor
    const documentRange = selectedEditor.document.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE))
    isWholeFile = selection.isEmpty || selection.isEqual(documentRange)
    text = selectedEditor.document.getText(isWholeFile ? undefined : selection)
  }
  return getChatPromptFromText(text, {
    isWholeFile,
    languageId: selectedEditor ? selectedEditor.document.languageId : undefined,
    ...options,
  })
}
