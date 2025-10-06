const normalizeCode = (code: string) => {
  return /(^\s*|\W)return\s+/.test(code) ? code : `return (${code})`
}

export const compileExpression = <SignatureGeneric extends Dict<any>, ResultGeneric>(code: string, parameterNames?: Array<keyof SignatureGeneric>): (context: SignatureGeneric) => ResultGeneric => {
  const normalizedCode = normalizeCode(code)
  const temporaryFunction = new Function(...parameterNames as Array<string>, normalizedCode) as (...args: Array<SignatureGeneric[keyof SignatureGeneric]>) => ResultGeneric
  return (context: SignatureGeneric) => {
    const args = Object.values(context) as Array<SignatureGeneric[keyof SignatureGeneric]>
    return temporaryFunction(...args)
  }
}

export const runExpression = <SignatureGeneric extends Dict<any>, ResultGeneric>(code: string, context: SignatureGeneric): ResultGeneric => {
  const temporaryFunction = compileExpression<SignatureGeneric, ResultGeneric>(code, Object.keys(context))
  return temporaryFunction(context)
}
