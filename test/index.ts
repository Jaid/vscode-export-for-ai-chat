import type Mocha from 'mocha'

import * as path from 'forward-slash-path'

export async function run(): Promise<void> {
  const {default: MochaLibrary} = await import('mocha')
  const mocha = new MochaLibrary({
    ui: 'bdd',
    color: true,
    timeout: 10_000,
  })
  const testsRoot = path.resolve(import.meta.dirname, '..')
  return new Promise((resolve, reject) => {
    try {
      mocha.addFile(path.resolve(testsRoot, 'test/main.test.js'))
      mocha.run(failures => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`))
        } else {
          resolve()
        }
      })
    } catch (error) {
      console.error(error)
      reject(error)
    }
  })
}
