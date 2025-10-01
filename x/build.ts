import type {BunPlugin} from 'bun'
import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'

const rootFolder = path.resolve(import.meta.dirname, '..')
const packageJsonPath = path.join(rootFolder, 'package.json')
const packageJson = await Bun.file(packageJsonPath).json() as PackageJson
const emitPackageJsonPlugin: BunPlugin = {
  name: 'EmitPackageJsonPlugin',
  setup(build) {
    build.onEnd(async result => {
      if (!result.success) {
        return
      }
      const relevantPackage = lodash.pick(packageJson, [
        'type',
        'repository',
        'homepage',
        'version',
        'description',
        'engines',
        'categories',
        'displayName',
        'contributes',
        'activationEvents',
        'extensionKind',
      ])
      const id = packageJson.name!.replace(/^vscode-/, '')
      const outPackage = {
        ...relevantPackage,
        name: id,
        main: 'extension.js',
        publisher: 'jaidchen',
      }
      const packageJsonFile = path.join(rootFolder, 'out', 'bun', 'package.json')
      await Bun.write(packageJsonFile, JSON.stringify(outPackage))
    })
  },
}
await Bun.build({
  entrypoints: [path.join(rootFolder, 'src', 'extension.ts')],
  outdir: path.join(rootFolder, 'out', 'bun'),
  target: 'node',
  external: ['vscode'],
  plugins: [emitPackageJsonPlugin],
  minify: true,
  sourcemap: 'external',
})
