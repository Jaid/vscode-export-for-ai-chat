import type {FirstParameter, SecondParameter} from 'more-types'

import {extensionConfig} from 'src/Configuration.js'
import {makeContext} from 'src/makeContext.js'
import {renderPrompt} from 'src/renderPrompt.js'

export const renderUserPrompt = async (contextOrItems: FirstParameter<typeof makeContext> | FirstParameter<typeof renderPrompt>, options: Omit<SecondParameter<typeof renderPrompt>, 'template'> = {}) => {
  const context = 'items' in contextOrItems ? contextOrItems : await makeContext(contextOrItems, options)
  return renderPrompt(context, {
    ...options,
    template: extensionConfig.template,
  })
}
