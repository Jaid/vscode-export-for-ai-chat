import type {FirstParameter, SecondParameter} from 'more-types'

import * as vscode from 'vscode'

import {makeContext} from 'src/makeContext.js'
import {renderPrompt} from 'src/renderPrompt.js'

export const renderUserPrompt = async (contextOrItems: FirstParameter<typeof makeContext> | FirstParameter<typeof renderPrompt>, options: Omit<SecondParameter<typeof renderPrompt>, 'template'> = {}) => {
  const config = vscode.workspace.getConfiguration('export-for-ai-chat')
  const handlebarsTemplate = config.get<string>('template')
  if (!handlebarsTemplate) {
    throw new Error('No handlebars template found in the “export-for-ai-chat.template” setting.')
  }
  const context = 'items' in contextOrItems ? contextOrItems : await makeContext(contextOrItems, options)
  return renderPrompt(context, {
    ...options,
    template: handlebarsTemplate,
  })
}
