import type {Language} from './languageIds.js'
import type {InputOptions} from 'more-types'
import type {Arrayable, Promisable} from 'type-fest'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {getLanguageFromLanguageId} from './languageIds.js'

type Context = {
  blankLine: '\n\n'
  codeCloser: string
  codeOpener: string
  hasMultiple: boolean
  items: Array<{
    code?: string
    file?: string
    fileName?: string
    fileRelative?: string
    folder?: string
    folderName?: string
    folderRelative?: string
    isWholeFile: boolean
    language?: Language
    languageId?: string
  }>
  newline: '\n'
  workspaceFolder?: string
  workspaceFolderName?: string
  workspaceName: string
}

type Options = InputOptions<{
  optionalOptions: {
    languageId: string
    modifyContext: (context: Context) => Promisable<Partial<Context>>
  }
}>

type TextInputItem = {
  text: string
}

type EditorInputItem = {
  editor: vscode.TextEditor
}

type FileInputItem = {
  uri: vscode.Uri
}

type InputItem = (EditorInputItem | FileInputItem | TextInputItem) & {
  languageId?: string
}

export const renderPrompt = async (items: Arrayable<InputItem>, options: Options['parameter'] = {}) => {
  items = Array.isArray(items) ? items : [items]
  const mergedOptions: Options['merged'] = {
    ...options,
  }
  const context: Context = {
    codeCloser: '```',
    codeOpener: '```',
    newline: '\n',
    blankLine: '\n\n',
    // TODO
  }
  // if (mergedOptions.languageId) {
  //   context.languageId = mergedOptions.languageId
  //   context.language = getLanguageFromLanguageId(mergedOptions.languageId)
  // }
  if (mergedOptions.modifyContext) {
    const modifiedContext = await mergedOptions.modifyContext(context)
    Object.assign(context, modifiedContext)
  }
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const handlebarsTemplate = config.get<string>('template')
  if (!handlebarsTemplate) {
    throw new Error('No handlebars template found in the “export-for-ai-chat.template” setting.')
  }
  const markdownCode = renderHandlebars(handlebarsTemplate, context)
  return markdownCode
}
