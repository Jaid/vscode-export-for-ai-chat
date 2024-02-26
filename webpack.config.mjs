import {fileURLToPath} from 'node:url'

import * as path from 'zeug/path'

const dirName = path.dirname(fileURLToPath(import.meta.url))
/**
 * @type {import('webpack').Configuration}
 */
const extensionConfig = {
  target: `node`,
  mode: `none`,
  entry: `./out/ts/src/extension.js`,
  output: {
    path: path.resolve(dirName, `out/webpack`),
    filename: `index.cjs`,
    libraryTarget: `commonjs2`,
  },
  externals: {
    vscode: `commonjs vscode`,
  },
  devtool: `inline-source-map`,
}
export default extensionConfig
