import type {InputOptions} from 'more-types'
import type {Context, InputItem} from 'src/makeContext.js'
import type {Arrayable, Promisable} from 'type-fest'

import * as vscode from 'vscode'
import {makeHandlebarsWithHelpers} from 'zeug'

import {makeContext} from 'src/makeContext.js'

type Options = InputOptions<{
  optionalOptions: {
    languageId: string
    modifyContext: (context: Context) => Promisable<Partial<Context>>
  }
}>

const handlebars = makeHandlebarsWithHelpers({
  trim: input => {
    return String(input).trim()
  },
  escapeFences: (input: string) => {
    return input.replaceAll(/^```/gm, '\\```')
  },
  fence: (code?: string) => {
    const codeNormalized = code?.replaceAll('\r', '\n') ?? ''
    const isSafe = (fence: string) => {
      if (codeNormalized.startsWith(fence)) {
        return false
      }
      if (codeNormalized.includes(`\n${fence}`)) {
        return false
      }
      return true
    }
    while (true) {
      let currentLength = 3
      const fence = '`'.repeat(currentLength)
      if (isSafe(fence) || currentLength === 8) {
        return fence
      }
      currentLength++
    }
  },
  isMultiple: (input: {length?: number}) => {
    if (!Object.hasOwn(input, 'length')) {
      return false
    }
    const length = input.length ?? 0
    return length > 1
  },
  json: (input, spaces: number = 2) => {
    return JSON.stringify(input, null, spaces)
  },
})

export const renderPrompt = async (contextOrItems: Arrayable<InputItem> | Context, options: Options['parameter'] = {}) => {
  let context: Context
  if ('items' in contextOrItems) {
    context = contextOrItems
  } else {
    context = await makeContext(contextOrItems, options)
  }
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const handlebarsTemplate = config.get<string>('template')
  if (!handlebarsTemplate) {
    throw new Error('No handlebars template found in the “export-for-ai-chat.template” setting.')
  }
  const render = handlebars.compile<Context>(handlebarsTemplate)
  const result = render(context)
  return result
}
