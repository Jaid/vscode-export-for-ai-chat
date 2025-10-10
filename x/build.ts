import type {BunPlugin} from 'bun'
import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'

import mapDeep, {matchAnySegment} from 'lib/mapDeep.ts'

const rootFolder = path.resolve(import.meta.dirname, '..')
const outputFolder = path.join(rootFolder, 'out', 'bun')
const inputPackageJsonFile = path.join(rootFolder, 'package.json')
const inputPackageJson = await Bun.file(inputPackageJsonFile).json() as PackageJson
const extensionId = inputPackageJson.name!.replace(/^vscode-/, '')
const normalizeContributes = (inputContributes: Dict<any>) => {
  const prefixWithId = (key: string) => {
    if (key.startsWith(`${extensionId}.`)) {
      return key
    }
    return `${extensionId}.${key}`
  }
  const outputContributes = mapDeep(inputContributes, (key, value, {rename, renameAndVisit, unchanged}) => {
    if (typeof value === 'string' && (key.match('commands', /^\d+$/, 'command') || key.match('menus', matchAnySegment, /^\d+$/, 'command'))) {
      return prefixWithId(value)
    }
    if (key.match('configuration', 'properties', matchAnySegment)) {
      const thisKey = key.node()
      if (!thisKey.startsWith(extensionId)) {
        return renameAndVisit(prefixWithId(thisKey))
      }
    }
    if (key.match('configuration', 'properties', matchAnySegment, 'description') && typeof value === 'string' && /(`|\]\(http)/.test(value)) {
      return rename('markdownDescription', value.replaceAll('\n', '  \n'))
    }
    return unchanged
  })
  if (outputContributes.configuration) {
    outputContributes.configuration.title = inputPackageJson.displayName || inputPackageJson.name
  }
  return outputContributes
}
const preparePackageJson = async () => {
  const relevantPackage = lodash.pick(inputPackageJson, [
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
  ]) as PackageJson
  const additionalContributesFile = Bun.file(path.join(rootFolder, 'contributes.yml'))
  const additionalContributesExists = await additionalContributesFile.exists()
  if (additionalContributesExists) {
    const additionalContributes = Bun.YAML.parse(await additionalContributesFile.text())
    if (additionalContributes) {
      const normalizedContributes = normalizeContributes(additionalContributes)
      lodash.merge(relevantPackage, {contributes: normalizedContributes})
    }
  }
  return {
    activationEvents: [],
    ...relevantPackage,
    name: extensionId,
    main: 'extension.js',
    publisher: 'jaidchen',
  }
}
const outputPackageJson = await preparePackageJson() as PackageJson
const emitPackageJsonPlugin: BunPlugin = {
  name: 'EmitPackageJsonPlugin',
  setup(build) {
    build.onEnd(async result => {
      if (!result.success) {
        return
      }
      if (Bun.env.NODE_ENV === 'production') {
        const iconFile = path.join(rootFolder, 'icon.jxl')
        const iconFileExists = await Bun.file(iconFile).exists()
        if (iconFileExists) {
          outputPackageJson.icon = 'icon.png'
          await Bun.$`magick ${iconFile} -resize '128x128>' png:- | oxipng --alpha --zopfli --opt max --out ${path.join(outputFolder, 'icon.png')} -`
        }
      }
      const packageJsonFile = path.join(outputFolder, 'package.json')
      await Bun.write(packageJsonFile, JSON.stringify(outputPackageJson))
    })
  },
}
await Bun.build({
  entrypoints: [path.join(rootFolder, 'src', 'extension.ts')],
  outdir: outputFolder,
  target: 'node',
  external: ['vscode'],
  plugins: [emitPackageJsonPlugin],
  minify: Bun.env.NODE_ENV === 'production',
  sourcemap: 'linked',
  define: {
    'Bun.env.npm_package_display_name': JSON.stringify(outputPackageJson.displayName || outputPackageJson.name),
    'Bun.env.npm_package_name': JSON.stringify(outputPackageJson.name),
    'Bun.env.npm_package_version': JSON.stringify(outputPackageJson.version),
  },
})
