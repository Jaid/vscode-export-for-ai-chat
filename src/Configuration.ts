import * as vscode from 'vscode'

import {compileExpression} from 'lib/runExpression.ts'
import {outputChannel} from 'src/outputChannel.js'

class Configuration {
  config: vscode.WorkspaceConfiguration
  constructor() {
    this.refresh()
  }
  get blacklistExpression() {
    type Context = {
      fullPath: string
      isFile: boolean
      isFolder: boolean
    }
    return this.getFunction<Context, boolean>('blacklistExpression', ['fullPath', 'isFile', 'isFolder'])
  }
  get showNotifications() {
    return this.getBoolean('showNotifications')
  }
  set showNotifications(value: boolean) {
    this.setValue('showNotifications', value)
  }
  get template() {
    return this.getString('template')
  }
  get tokenizer() {
    return this.getValue<'o200k_base' | false>('tokenizer')
  }
  getBoolean(section: string) {
    return this.getValue<boolean>(section)
  }
  getFunction<ContextGeneric extends Dict<any>, ResultGeneric>(section: string, parameterNames: Array<keyof ContextGeneric>) {
    const code = this.getString(section).trim()
    try {
      return compileExpression<ContextGeneric, ResultGeneric>(code, parameterNames)
    } catch (error) {
      outputChannel.appendLine(`Error compiling function for ${section}\n\`\`\`js\n${code}\n\`\`\`\n${error}`)
      return (context: ContextGeneric) => {
        throw error
      }
    }
  }
  getString(section: string) {
    return this.getValue<string>(section)
  }
  getValue<T>(section: string): T {
    return this.config.get<T>(section, this.config.inspect<T>(section)?.defaultValue as T)
  }
  makeListener() {
    const configurationListener = vscode.workspace.onDidChangeConfiguration(event => this.#onChange(event))
    return configurationListener
  }
  refresh() {
    this.config = vscode.workspace.getConfiguration(Bun.env.npm_package_name)
  }
  setValue<T>(section: string, value: T) {
    return this.config.update(section, value, vscode.ConfigurationTarget.Global)
  }
  #onChange(event: vscode.ConfigurationChangeEvent) {
    if (!event.affectsConfiguration(Bun.env.npm_package_name!)) {
      return
    }
    outputChannel.appendLine('Configuration changed')
    this.refresh()
  }
}

export const extensionConfig = new Configuration
