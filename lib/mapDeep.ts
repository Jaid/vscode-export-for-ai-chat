import type {Dict} from 'more-types'

// ============================================================================
// Symbols
// ============================================================================

const deletedMarker = Symbol('deletedMarker')
const unchanged = Symbol('unchanged')
const renameMarkerSymbol = Symbol('renameMarker')
export const deleteSymbol = Symbol('delete')
export const matchAnySegments = Symbol('matchAnySegments')
export const matchAnySegment = Symbol('matchAnySegment')

// ============================================================================
// Types
// ============================================================================

type PathSegment = {
  isArray: boolean
  key: string
}

type RenameMarker = {
  key: string
  revisit?: boolean
  value?: any
  // eslint-disable-next-line perfectionist/sort-object-types
  [renameMarkerSymbol]: true
}

type ActionToolset = {
  delete: typeof deleteSymbol
  rename: (newKey: string, value?: any) => RenameMarker
  renameAndVisit: (newKey: string, value?: any) => RenameMarker
  unchanged: typeof unchanged
}

type PathSegmentMatcher = RegExp | typeof matchAnySegment | typeof matchAnySegments | number | string

type KeyObject = Array<PathSegment> & {
  endsWith: (...segments: Array<string>) => boolean
  match: (...segments: Array<PathSegmentMatcher>) => boolean
  node: () => string
  parent: () => string
  parents: () => string
  startsWith: (...segments: Array<string>) => boolean
  toArray: () => string
  toLodash: () => string
  toString: () => string
}

type ProcessResult = {
  renamed?: string
  revisit?: boolean
  value: any
}

// ============================================================================
// Path Formatting Helpers
// ============================================================================

const formatSimplePath = (pathParts: Array<PathSegment>): string => {
  return pathParts.map((part, index) => {
    return index === 0 ? part.key : `.${part.key}`
  }).join('')
}
const formatLodashPath = (pathParts: Array<PathSegment>): string => {
  return pathParts.map((part, index) => {
    if (part.isArray) {
      return `[${part.key}]`
    }
    return index === 0 ? part.key : `.${part.key}`
  }).join('')
}
const formatArrayPath = (pathParts: Array<PathSegment>): string => {
  return pathParts.map(part => {
    if (part.isArray) {
      return `[${part.key}]`
    }
    return `['${part.key}']`
  }).join('')
}
const getNodeKey = (pathParts: Array<PathSegment>): string => {
  if (pathParts.length === 0) {
    return ''
  }
  return pathParts.at(-1)!.key
}
const getParentKey = (pathParts: Array<PathSegment>): string => {
  if (pathParts.length < 2) {
    return ''
  }
  return pathParts.at(-2)!.key
}
const getParentsPath = (pathParts: Array<PathSegment>): string => {
  if (pathParts.length <= 1) {
    return ''
  }
  return pathParts.slice(0, -1).map((part, index) => {
    return index === 0 ? part.key : `.${part.key}`
  })
    .join('')
}

// ============================================================================
// ============================================================================
// Pattern Matching Logic
// ============================================================================
// eslint-disable-next-line stylistic/padding-line-between-statements
const matchPattern = (pathParts: Array<PathSegment>,
  segments: Array<PathSegmentMatcher>): boolean => {
  if (segments.length === 0) {
    return false
  }
  // Recursive matching function with backtracking for matchAnything
  const matchFrom = (pathIndex: number, segmentIndex: number): boolean => {
    // If we've consumed all segments, success if we've also consumed all path parts
    if (segmentIndex >= segments.length) {
      return pathIndex >= pathParts.length
    }
    // If we've consumed all path parts but still have segments, fail unless remaining segments are matchAnything
    if (pathIndex >= pathParts.length) {
      return segments.slice(segmentIndex).every(seg => seg === matchAnySegments)
    }
    const segment = segments[segmentIndex]
    const pathPart = pathParts[pathIndex]
    // Handle matchAnything - try matching 0 or more path parts
    if (segment === matchAnySegments) {
      // Try matching 0 path parts (skip matchAnything)
      if (matchFrom(pathIndex, segmentIndex + 1)) {
        return true
      }
      // Try matching 1 or more path parts (consume one and keep matchAnything)
      return matchFrom(pathIndex + 1, segmentIndex)
    }
    // Handle boolean true - match exactly one path part (any value)
    if (segment === matchAnySegment) {
      return matchFrom(pathIndex + 1, segmentIndex + 1)
    }
    // Handle RegExp
    if (segment instanceof RegExp) {
      if (segment.test(pathPart.key)) {
        return matchFrom(pathIndex + 1, segmentIndex + 1)
      }
      return false
    }
    // Handle string and number
    const segmentString = String(segment)
    if (pathPart.key === segmentString) {
      return matchFrom(pathIndex + 1, segmentIndex + 1)
    }
    return false
  }
  return matchFrom(0, 0)
}
const matchStartsWith = (pathParts: Array<PathSegment>, segments: Array<string>): boolean => {
  return matchPattern(pathParts, [...segments, matchAnySegments])
}
const matchEndsWith = (pathParts: Array<PathSegment>, segments: Array<string>): boolean => {
  return matchPattern(pathParts, [matchAnySegments, ...segments])
}

// ============================================================================
// KeyObject Builder
// ============================================================================
// eslint-disable-next-line stylistic/padding-line-between-statements
const buildKeyObject = (pathParts: Array<PathSegment>): KeyObject => {
  const result = [...pathParts] as KeyObject
  result.toString = () => formatSimplePath(pathParts)
  result.toLodash = () => formatLodashPath(pathParts)
  result.toArray = () => formatArrayPath(pathParts)
  result.node = () => getNodeKey(pathParts)
  result.parent = () => getParentKey(pathParts)
  result.parents = () => getParentsPath(pathParts)
  result.match = (...segments) => matchPattern(pathParts, segments)
  result.startsWith = (...segments) => matchStartsWith(pathParts, segments)
  result.endsWith = (...segments) => matchEndsWith(pathParts, segments)
  return result
}

// ============================================================================
// Action Builders
// ============================================================================
// eslint-disable-next-line stylistic/padding-line-between-statements
const createRenameMarker = (newKey: string, revisit: boolean, args: [any?]): RenameMarker => {
  // Use rest parameter length to detect if second argument was passed
  const hasValue = args.length > 0
  // eslint-disable-next-line typescript/no-unsafe-assignment
  const newValue = hasValue ? args[0] : unchanged
  return {
    [renameMarkerSymbol]: true,
    key: newKey,
    revisit,
    // eslint-disable-next-line typescript/no-unsafe-assignment
    value: newValue,
  }
}

// ============================================================================
// Main MapDeep Function
// ============================================================================

/**
 * @function
 * @param key a key object with formatting methods, the value, and action methods. The key object provides: toString() for simple format like 'a.b.0.c', toLodash() for lodash format like 'a.b[0].c', toArray() for array format like "['a']['b'][0]['c']", node() for just the current key, parent() for just the parent key, parents() for the path excluding the current key, match(...segments) to check if the path matches a pattern (supports strings, numbers, RegExp, true for single wildcard, and matchAnything symbol for multi-level wildcard), startsWith(...segments) to check if the path starts with the given segments, and endsWith(...segments) to check if the path ends with the given segments.
 * @param value the current value at the key
 * @param actions additional tools to perform actions like delete or rename. Also includes actions.unchanged symbol.
 * @returns the original value argument to keep it unchanged, or actions.unchanged symbol for the same effect, or anything else to alter it
 */
type MapperFunction = (key: KeyObject, value: any, actions: ActionToolset) => any

/**
 * Visits every entry in an object recursively and allows changes on each of them.
 * @param input the input object
 * @param mapper the function that is called for each entry. The mapper can return actions.delete to skip adding the current entry, return actions.unchanged to keep the value as-is, return actions.rename(newKey) to rename the current key with the original value, or return actions.rename(newKey, newValue) to rename and transform. Use actions.renameAndVisit() to re-run the mapper on the renamed key. The mapper should return the new value (which can be different from the input value to transform it).
 * @returns the new object with all changes applied
 */
export const mapDeep = (input: Dict<any>, mapper: MapperFunction): Dict<any> => {
  const processValue = (value: any, pathParts: Array<PathSegment>): ProcessResult | typeof deletedMarker => {
    const keyObject = buildKeyObject(pathParts)
    // Create action state for side-effect style (still supported for backwards compatibility)
    let renamedTo: string | undefined
    let renamedValue: any = unchanged
    const actions: ActionToolset = {
      delete: deleteSymbol,
      rename(newKey: string, ...args: [any?]) {
        renamedTo = newKey
        const marker = createRenameMarker(newKey, false, args)
        if (args.length > 0) {
          // eslint-disable-next-line typescript/no-unsafe-assignment
          renamedValue = marker.value
        }
        return marker
      },
      renameAndVisit(newKey: string, ...args: [any?]) {
        renamedTo = newKey
        const marker = createRenameMarker(newKey, true, args)
        if (args.length > 0) {
          // eslint-disable-next-line typescript/no-unsafe-assignment
          renamedValue = marker.value
        }
        return marker
      },
      unchanged,
    }
    // eslint-disable-next-line typescript/no-unsafe-assignment
    const mappedValue = mapper(keyObject, value, actions)
    // Check if return value is unchanged symbol
    if (mappedValue === unchanged) {
      // eslint-disable-next-line typescript/no-use-before-define
      return processUnchangedValue(value, pathParts)
    }
    // Check if return value is delete symbol
    if (mappedValue === deleteSymbol) {
      return deletedMarker
    }
    // Check if return value is rename marker
    if (mappedValue !== null && typeof mappedValue === 'object' && renameMarkerSymbol in mappedValue) {
      const marker = mappedValue as RenameMarker
      return {
        renamed: marker.key,
        revisit: marker.revisit,
        // eslint-disable-next-line typescript/no-unsafe-assignment
        value: marker.value === unchanged ? value : marker.value,
      }
    }
    // Handle rename action (side effect style, still supported for backwards compatibility)
    if (renamedTo !== undefined) {
      return {
        renamed: renamedTo,
        // eslint-disable-next-line typescript/no-unsafe-assignment
        value: renamedValue === unchanged ? mappedValue : renamedValue,
      }
    }
    // Process the mapped value recursively
    // eslint-disable-next-line typescript/no-use-before-define
    return processComplexValue(mappedValue, pathParts)
  }
  const processUnchangedValue = (value: any, pathParts: Array<PathSegment>): ProcessResult => {
    // User wants to keep original value, continue processing
    // If the value is an object or array, recursively process its children
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        return {
          value: value
            .map((item, index) => processValue(item, [
              ...pathParts, {
                isArray: true,
                key: String(index),
              },
            ]))
            .filter(item => item !== deletedMarker)
            // eslint-disable-next-line typescript/no-unsafe-return
            .map(result => result.value),
        }
      }
      return {
        // eslint-disable-next-line typescript/no-use-before-define
        value: processObjectChildren(value, pathParts),
      }
    }
    return {
      // eslint-disable-next-line typescript/no-unsafe-assignment
      value,
    }
  }
  const processComplexValue = (mappedValue: any, pathParts: Array<PathSegment>): ProcessResult => {
    // If the mapped value is an object or array, recursively process its children
    if (mappedValue !== null && typeof mappedValue === 'object') {
      if (Array.isArray(mappedValue)) {
        return {
          value: mappedValue
            .map((item, index) => processValue(item, [
              ...pathParts, {
                isArray: true,
                key: String(index),
              },
            ]))
            .filter(item => item !== deletedMarker)
            // eslint-disable-next-line typescript/no-unsafe-return
            .map(result => result.value),
        }
      }
      return {
        // eslint-disable-next-line typescript/no-use-before-define
        value: processObjectChildren(mappedValue, pathParts),
      }
    }
    return {
      // eslint-disable-next-line typescript/no-unsafe-assignment
      value: mappedValue,
    }
  }
  const processObjectChildren = (object: any, pathParts: Array<PathSegment>): Dict<any> => {
    const result: Dict<any> = {}
    // eslint-disable-next-line typescript/no-unsafe-argument
    for (const [originalKey, childValue] of Object.entries(object)) {
      let childKey = originalKey
      let processed = processValue(childValue, [
        ...pathParts, {
          isArray: false,
          key: childKey,
        },
      ])
      // Handle rename with optional revisit
      while (processed !== deletedMarker && processed.renamed && processed.revisit) {
        childKey = processed.renamed
        processed = processValue(processed.value, [
          ...pathParts, {
            isArray: false,
            key: childKey,
          },
        ])
      }
      // If renamed but no revisit, just use the new key
      if (processed !== deletedMarker && processed.renamed && !processed.revisit) {
        childKey = processed.renamed
      }
      if (processed !== deletedMarker) {
        // eslint-disable-next-line typescript/no-unsafe-assignment
        result[childKey] = processed.value
      }
    }
    return result
  }
  // Process top-level entries
  const result: Dict<any> = {}
  for (const [originalKey, value] of Object.entries(input)) {
    let key = originalKey
    let processed = processValue(value, [
      {
        isArray: false,
        key,
      },
    ])
    // Handle rename with optional revisit
    while (processed !== deletedMarker && processed.renamed && processed.revisit) {
      key = processed.renamed
      processed = processValue(processed.value, [
        {
          isArray: false,
          key,
        },
      ])
    }
    // If renamed but no revisit, just use the new key
    if (processed !== deletedMarker && processed.renamed && !processed.revisit) {
      key = processed.renamed
    }
    if (processed !== deletedMarker) {
      // eslint-disable-next-line typescript/no-unsafe-assignment
      result[key] = processed.value
    }
  }
  return result
}

export default mapDeep
