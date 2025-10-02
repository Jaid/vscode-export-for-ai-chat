import type {Context} from 'src/makeContext.js'

export const normalizeContext = (context: Partial<Context>): Context => {
  if (!context.code) {
    Object.assign(context, context.items?.[0])
  }
  return context as Context
}
