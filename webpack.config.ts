import type {PackageJson} from 'type-fest'
import type webpack from 'webpack'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import * as lodash from 'lodash-es'

class EmitPackageJsonPlugin {
  private packageJson: PackageJson
  constructor(packageJson: PackageJson) {
    this.packageJson = packageJson
  }
  apply(compiler: webpack.Compiler) {
    compiler.hooks.emit.tap('EmitPackageJsonPlugin', compilation => {
      const relevantPackage = lodash.pick(this.packageJson, ['repository', 'homepage', 'version', 'description', 'engines', 'categories', 'displayName', 'contributes', 'activationEvents', 'extensionKind'])
      const id = this.packageJson.name!.replace(/^vscode-/, '')
      const outPackage = {
        ...relevantPackage,
        name: id,
        type: 'module',
        main: 'index.js',
        engines: {
          vscode: '^1.85.0',
        },
        publisher: 'jaidchen',
      }
      const content = JSON.stringify(outPackage)
      type Asset = {
        size: () => number
        source: () => string
      }
      const assets = compilation.assets as Record<string, Asset>
      assets['package.json'] = {
        size: () => content.length,
        source: () => content,
      }
    })
  }
}
const packageJson = await fs.readJson('package.json') as PackageJson
const extensionConfig: webpack.Configuration = {
  target: 'node',
  mode: 'none',
  entry: './out/ts/src/extension.js',
  output: {
    path: path.resolve(import.meta.dirname, 'out/webpack'),
    filename: 'index.js',
    libraryTarget: 'module',
  },
  externals: {
    vscode: 'module vscode',
  },
  devtool: 'inline-source-map',
  plugins: [new EmitPackageJsonPlugin(packageJson)],
  experiments: {
    outputModule: true,
  },
}
export default extensionConfig
