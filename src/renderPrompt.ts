import type {InputOptions} from 'more-types'
import type {Context} from 'src/makeContext.js'
import type {Promisable} from 'type-fest'

import {handlebars} from 'lib/handlebars.ts'
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
