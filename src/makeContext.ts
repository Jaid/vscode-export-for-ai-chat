import type {Language} from './languageIds.js'
import type {InputOptions} from 'more-types'
import type {Arrayable, Promisable} from 'type-fest'

import * as lodash from 'lodash-es'
import * as vscode from 'vscode'

import {getLanguageFromLanguageId} from './languageIds.js'

type ContextItem = {
  code: string
  file?: string
  fileName?: string
  fileRelative?: string
  folder?: string
  folderName?: string
  folderRelative?: string
  isWholeFile: boolean
  language?: Language
  languageId?: string
}

export type Context = {
  blankLine: '\n\n'
  codeCloser: string
  codeOpener: string
  hasMultiple: boolean
  items: Array<ContextItem>
  newline: '\n'
  workspaceFolder?: string
  workspaceFolderName?: string
  workspaceName: string
} & ContextItem

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

type Options = InputOptions<{
  optionalOptions: {
    languageId: string
    modifyContext: (context: Context) => Promisable<Partial<Context>>
  }
}>

type CommonItem = {
  isWholeFile: boolean
  languageId?: string
  text?: string
  uri?: vscode.Uri
}

const makeCommonItem = async (inputItem: InputItem): Promise<CommonItem> => {
  if ('editor' in inputItem) {
    const {editor} = inputItem
    const {selection, document: editorDocument} = editor
    return {
      text: editorDocument.getText(selection),
      languageId: editorDocument.languageId,
      uri: editorDocument.uri,
      isWholeFile: selection.isEmpty,
    }
  }
  if ('uri' in inputItem) {
    const {uri: itemUri} = inputItem
    const document = await vscode.workspace.openTextDocument(itemUri)
    return {
      text: document.getText(),
      languageId: inputItem.languageId ?? document.languageId,
      uri: itemUri,
      isWholeFile: true,
    }
  }
  if ('text' in inputItem) {
    const {text: itemText, languageId: itemLanguageId} = inputItem
    return {
      text: itemText,
      languageId: itemLanguageId,
      isWholeFile: false,
    }
  }
  return {
    text: '',
    isWholeFile: true,
  }
}
const getContextItemFromInputItem = async (inputItem: InputItem): Promise<ContextItem> => {
  const item = await makeCommonItem(inputItem)
  const language = item.languageId ? getLanguageFromLanguageId(item.languageId) : undefined
  const workspaceFolder = item.uri ? vscode.workspace.getWorkspaceFolder(item.uri) : undefined
  const fileRelative = item.uri && workspaceFolder ? vscode.workspace.asRelativePath(item.uri, false) : undefined
  const fileName = item.uri ? item.uri.path.split('/').pop() : undefined
  return {
    code: item.text ?? '',
    languageId: inputItem.languageId ?? item.languageId,
    language,
    isWholeFile: item.isWholeFile,
    file: item.uri?.fsPath,
    fileName,
    fileRelative,
  }
}

export const makeContext = async (items: Arrayable<InputItem>, options: Options['parameter'] = {}): Promise<Context> => {
  const mergedOptions: Options['merged'] = {
    ...options,
  }
  const itemsArray = lodash.castArray(items)
  const processedItems = await Promise.all(itemsArray.map(getContextItemFromInputItem))
  const {workspaceFolders} = vscode.workspace
  const workspaceFolder = workspaceFolders?.[0]
  const workspaceName = workspaceFolder?.name ?? 'Unknown'
  const context: Context = {
    codeCloser: '`' + '`' + '`',
    codeOpener: '`' + '`' + '`',
    newline: '\n',
    blankLine: '\n\n',
    hasMultiple: processedItems.length > 1,
    items: processedItems,
    workspaceFolder: workspaceFolder?.uri.fsPath,
    workspaceFolderName: workspaceFolder?.name,
    workspaceName,
    ...processedItems[0],
  }
  if (mergedOptions.modifyContext) {
    const modifiedContext = await mergedOptions.modifyContext(context)
    Object.assign(context, modifiedContext)
  }
  return context
}
