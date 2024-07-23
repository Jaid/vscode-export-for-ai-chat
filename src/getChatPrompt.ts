import type {Language} from './languageIds.js'
import type {InputOptions} from 'more-types'

import * as vscode from 'vscode'
import {resolveTemplate} from 'zeug'

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

type Context = {
  blankLine: `\n\n`
  code?: string
  codeCloser: string
  codeOpener: string
  isWholeFile: boolean
  language?: Language
  languageId?: string
  newline: `\n`
}

export const copyPrompt = async (prompt: string, options: CopyOptions["parameter"] = {}) => {
  const mergedOptions: CopyOptions["merged"] = {
    ...options,
  }
  await vscode.env.clipboard.writeText(prompt)
  const logMessageTemplate = `Copied {{#if language.title}}{{language.title}} code{{else}}text{{/if}} for AI chat ({{#if code}}{{code.length}} code characters, {{/if}}{{prompt.length}} total characters).`
  const logMessage = resolveTemplate(logMessageTemplate, {
    ...mergedOptions.context,
    prompt,
  })
  const config = vscode.workspace.getConfiguration(`export-for-ai-chat`)
  const showNotifications = config.get<boolean>(`showNotifications`)
  if (showNotifications) {
    await vscode.window.showInformationMessage(logMessage)
  }
  outputChannel.appendLine(logMessage)
}

export const getChatPromptFromText = async (text?: string, options: Options["parameter"] = {}) => {
  const mergedOptions: Options["merged"] = {
    ...defaultOptions,
    ...options,
  }
  const context: Context = {
    isWholeFile: mergedOptions.isWholeFile,
    code: text ? text.trim() : undefined,
    codeCloser: `\`\`\``,
    codeOpener: `\`\`\``,
    newline: `\n`,
    blankLine: `\n\n`,
  }
  if (mergedOptions.languageId) {
    context.languageId = mergedOptions.languageId
    context.language = getLanguageFromLanguageId(mergedOptions.languageId)
  }
  const config = vscode.workspace.getConfiguration(`export-for-ai-chat`)
  const handlebarsTemplate = config.get<string>(`template`)
  if (!handlebarsTemplate) {
    throw new Error(`No handlebars template found in the “export-for-ai-chat.template” setting.`)
  }
  const markdownCode = resolveTemplate(handlebarsTemplate, context)
  if (mergedOptions.copyToClipboard) {
    await copyPrompt(markdownCode, {
      context,
    })
  }
  return markdownCode
}

export const getChatPromptFromEditor = async (editor?: vscode.TextEditor, options: Options["parameter"] = {}) => {
  const selectedEditor = editor ?? vscode.window.activeTextEditor
  let text: string | undefined
  let isWholeFile = defaultOptions.isWholeFile
  if (selectedEditor) {
    const selection = selectedEditor.selection
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
