import type {Language} from './languageIds.js'
import type {InputOptions} from 'more-types'
import type {Arrayable, Promisable} from 'type-fest'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {getLanguageFromLanguageId} from './languageIds.js'

export type Context = {
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

export type InputItem = (EditorInputItem | FileInputItem | TextInputItem) & {
  languageId?: string
}

export const renderPrompt = async (items: Arrayable<InputItem>, options: Options['parameter'] = {}) => {
  const itemsArray = Array.isArray(items) ? items : [items]
  const mergedOptions: Options['merged'] = {
    ...options,
  }
  // Process each item to build context
  const processedItems = await Promise.all(itemsArray.map(async item => {
    let text: string | undefined
    let languageId: string | undefined
    let uri: vscode.Uri | undefined
    let isWholeFile = false
    if ('editor' in item) {
      const {editor} = item
      const {selection, document: editorDocument} = editor
      const {languageId: documentLanguageId, uri: documentUri} = editorDocument
      const documentRange = editorDocument.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE))
      isWholeFile = selection.isEmpty || selection.isEqual(documentRange)
      text = editorDocument.getText(isWholeFile ? undefined : selection)
      languageId = item.languageId ?? documentLanguageId
      uri = documentUri
    } else if ('uri' in item) {
      const {uri: itemUri} = item
      uri = itemUri
      const document = await vscode.workspace.openTextDocument(uri)
      text = document.getText()
      languageId = item.languageId ?? document.languageId
      isWholeFile = true
    } else if ('text' in item) {
      const {text: itemText, languageId: itemLanguageId} = item
      text = itemText
      languageId = itemLanguageId
      isWholeFile = false
    }
    const language = languageId ? getLanguageFromLanguageId(languageId) : undefined
    const workspaceFolder = uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined
    const fileRelative = uri && workspaceFolder ? vscode.workspace.asRelativePath(uri, false) : undefined
    const fileName = uri ? uri.path.split('/').pop() : undefined
    return {
      code: text,
      languageId,
      language,
      isWholeFile,
      file: uri?.fsPath,
      fileName,
      fileRelative,
    }
  }))
  const {workspaceFolders} = vscode.workspace
  const workspaceFolder = workspaceFolders?.[0]
  const workspaceName = workspaceFolder?.name ?? 'Unknown'
  const context: Context = {
    codeCloser: '```',
    codeOpener: '```',
    newline: '\n',
    blankLine: '\n\n',
    hasMultiple: processedItems.length > 1,
    items: processedItems,
    workspaceFolder: workspaceFolder?.uri.fsPath,
    workspaceFolderName: workspaceFolder?.name,
    workspaceName,
  }
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
