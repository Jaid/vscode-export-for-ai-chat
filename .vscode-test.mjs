import {defineConfig} from '@vscode/test-cli'
import * as path from 'forward-slash-path'

export default defineConfig({
  files: 'temp/test_environment/test/*.js',
  extensionDevelopmentPath: import.meta.dirname,
  workspaceFolder: path.join(import.meta.dirname, 'private/test_project'),
  launchArgs: ['--disable-extensions'],
  mocha: {
    ui: 'bdd',
  },
})
