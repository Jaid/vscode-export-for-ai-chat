import type {InputOptions} from 'more-types'
import type {Arrayable, Promisable} from 'type-fest'

import * as vscode from 'vscode'
import {renderHandlebars} from 'zeug'

import {type Context, type InputItem, makeContext} from './makeContext.js'

export type {Context, InputItem} from './makeContext.js'

type Options = InputOptions<{
  optionalOptions: {
    languageId: string
    modifyContext: (context: Context) => Promisable<Partial<Context>>
  }
}>

export const renderPrompt = async (contextOrItems: Arrayable<InputItem> | Context, options: Options['parameter'] = {}) => {
  let context: Context
  if ('items' in contextOrItems && 'hasMultiple' in contextOrItems) {
    context = contextOrItems
  } else {
    context = await makeContext(contextOrItems, options)
  }
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const handlebarsTemplate = config.get<string>('template')
  if (!handlebarsTemplate) {
    throw new Error('No handlebars template found in the “export-for-ai-chat.template” setting.')
  }
  const markdownCode = renderHandlebars(handlebarsTemplate, context, {
    trim: input => {
      return String(input).trim()
    },
    escapeFences: (input: string) => {
      return input.replaceAll(/^```/gm, '\\```')
    },
    fence: (code: string) => {
      if (/(^|\n)```/.test(code)) {
        return '````'
      }
      return '```'
    },
    isMultiple: (input: {length?: number}) => {
      if (!Object.hasOwn(input, 'length')) {
        return false
      }
      const length = input.length ?? 0
      return length > 1
    },
  })
  return markdownCode
}
