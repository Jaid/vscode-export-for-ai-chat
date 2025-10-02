import type {InputOptions} from 'more-types'
import type {Context} from 'src/makeContext.js'
import type {Promisable} from 'type-fest'

import {makeHandlebarsWithHelpers} from 'zeug'

import {normalizeContext} from 'src/normalizeContext.js'

type Options = InputOptions<{
  defaultsType: typeof defaultOptions
  optionalOptions: {
    languageId: string
    modifyContext: (context: Context) => Promisable<Partial<Context>>
  }
}>

const defaultOptions = {
  template: '{{code}}',
}
const handlebars = makeHandlebarsWithHelpers({
  trim: input => {
    return String(input).trim()
  },
  escapeFences: (input: string) => {
    return input.replaceAll(/^```/gm, '\\```')
  },
  fence: (code?: string) => {
    const codeNormalized = (code ?? '').replaceAll('\r', '\n')
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
  blankLine: (count: number = 1) => {
    return '\n'.repeat(count + 1)
  },
  newLine: (count: number = 1) => {
    return '\n'.repeat(count)
  },
})

export const renderPrompt = (context: Context, options: Options['parameter'] = {}) => {
  const mergedOptions: Options['merged'] = {
    ...defaultOptions,
    ...options,
  }
  const render = handlebars.compile<Context>(mergedOptions.template)
  const contextNormalized = normalizeContext(context)
  const result = render(contextNormalized)
  return result
}
