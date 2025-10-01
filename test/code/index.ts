import * as path from 'forward-slash-path'

export async function run(): Promise<void> {
  const {default: MochaLibrary} = await import('mocha')
  const mocha = new MochaLibrary({
    ui: 'bdd',
  })
  return new Promise((resolve, reject) => {
    try {
      mocha.addFile(path.join(import.meta.dirname, 'extension.test.js'))
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
