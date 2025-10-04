import type {PackageJson} from 'type-fest'

import * as path from 'forward-slash-path'
import * as lodash from 'lodash-es'
import {toYaml} from 'zeug'

const rootFolder = path.resolve(import.meta.dirname, '..')
const templateFile = path.join(rootFolder, 'etc', 'default_template.md.hbs')
const templateContent = await Bun.file(templateFile).text()
const updateContributes = async () => {
  const contributesFile = path.join(rootFolder, 'contributes.yml')
  const contributes = Bun.YAML.parse(await Bun.file(contributesFile).text()) as PackageJson['contributes']
  const templateContentSquashed = templateContent.replaceAll('\n', '').trim()
  // @ts-expect-error TS2769
  lodash.set(contributes, 'configuration.properties["export-for-ai-chat.template"].default', templateContentSquashed)
  const output = toYaml(contributes)
  await Bun.write(contributesFile, `yaml-language-server: $schema=https://gist.githubusercontent.com/Jaid/1196746806dc7be1eaa7783e4d7b388a/raw/extension_manifest.schema.json#properties/contributes\n${output}`)
}
const updateReadme = async () => {
  const defaultTextPattern = /(?<before>.+Current default.+?```.*?\n)(?<match>.+?)(?<after>\n```.+)/s
  const update = (text: string, newDefault: string) => {
    return text.replace(defaultTextPattern, (_, before, match, after) => {
      return before + newDefault.trim() + after
    })
  }
  const readmeFile = path.join(rootFolder, 'readme.md')
  const readme = await Bun.file(readmeFile).text()
  const readmeUpdated = update(readme, templateContent)
  await Bun.write(readmeFile, readmeUpdated)
}
await Promise.all([
  updateContributes(),
  updateReadme(),
])
