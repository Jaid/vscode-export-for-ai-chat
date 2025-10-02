import {makeHandlebarsWithHelpers} from 'zeug'

const blankLine = (count: number = 1) => {
  return '\n'.repeat(count + 1)
}
const newLine = (count: number = 1) => {
  return '\n'.repeat(count)
}
const fence = (code?: string) => {
  if (!code) {
    return '```'
  }
  const codeNormalized = code.replaceAll('\r', '\n')
  const isSafe = (candidate: string) => {
    if (codeNormalized.startsWith(candidate)) {
      return false
    }
    if (codeNormalized.includes(`\n${candidate}`)) {
      return false
    }
    return true
  }
  let currentLength = 3
  while (true) {
    const ticks = '`'.repeat(currentLength)
    if (isSafe(ticks) || currentLength === 8) {
      return ticks
    }
    currentLength++
  }
}

export const handlebars = makeHandlebarsWithHelpers({
  trim: input => {
    return String(input).trim()
  },
  escapeFences: input => {
    return String(input).replaceAll(/^```/gm, '\\```')
  },
  isMultiple: (input: {length?: number}) => {
    if (!Object.hasOwn(input, 'length')) {
      return false
    }
    const length = input.length ?? 0
    return length > 1
  },
  json: (input, spaces: number = 2) => {
    return JSON.stringify(input, null, spaces)
  },
  fence() {
    const args = [...arguments].slice(0, -1) as Parameters<typeof fence>
    return fence(...args)
  },
  newLine() {
    const args = [...arguments].slice(0, -1) as Parameters<typeof newLine>
    return newLine(...args)
  },
  blankLine() {
    const args = [...arguments].slice(0, -1) as Parameters<typeof blankLine>
    return blankLine(...args)
  },
})
