import type {InputOptions} from 'more-types'
import {getLanguageFromLanguageId} from './languageIds.js'
import {renderHandlebars} from 'zeug'
import type {Language} from './languageIds.js'
import * as vscode from 'vscode'
import type {Arrayable, Promisable} from 'type-fest'

type Context = {
  blankLine: `\n\n`
  codeCloser: string
  codeOpener: string
  newline: `\n`
  workspaceFolder?: string
  workspaceFolderName?: string
  workspaceName: string
  hasMultiple: boolean
  items: Array<{
    code?: string
    language?: Language
    languageId?: string
    isWholeFile: boolean
    file?: string
    fileRelative?: string
    fileName?: string
    folder?: string
    folderRelative?: string
    folderName?: string
  }>
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

type InputItem  = (TextInputItem | FileInputItem | EditorInputItem) & {
  languageId?: string
}

export const renderPrompt = async (items: Arrayable<InputItem>, options: Options["parameter"] = {}) => {
  items = Array.isArray(items) ? items : [items]
  const mergedOptions: Options["merged"] = {
    ...options,
  }
  const context: Context = {
    codeCloser: `\`\`\``,
    codeOpener: `\`\`\``,
    newline: `\n`,
    blankLine: `\n\n`,
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
  const config = vscode.workspace.getConfiguration(`export-for-ai-chat`)
  const handlebarsTemplate = config.get<string>(`template`)
  if (!handlebarsTemplate) {
    throw new Error(`No handlebars template found in the “export-for-ai-chat.template” setting.`)
  }
  const markdownCode = renderHandlebars(handlebarsTemplate, context)
  return markdownCode
}
