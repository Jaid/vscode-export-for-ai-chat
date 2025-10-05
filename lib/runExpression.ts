export const runExpression = <SignatureGeneric extends Dict<any>, ResultGeneric>(code: string, context: SignatureGeneric): ResultGeneric => {
  const normalizedCode = /(^\s*|\W)return\s+/.test(code) ? code : `return (${code})`
  const temporaryFunction = new Function(...Object.keys(context), normalizedCode) as (...args: Array<SignatureGeneric[keyof SignatureGeneric]>) => ResultGeneric
  return temporaryFunction(...Object.values(context))
}
