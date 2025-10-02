import {expect, test} from 'bun:test'

import {renderPrompt} from 'src/renderPrompt.js'

test('renderPrompt (minimal)', () => {
  const result = renderPrompt({
    code: 'export default 1',
  })
  expect(result).toBe('export default 1')
})
test('renderPrompt (with helpers)', () => {
  const result = renderPrompt({
    code: ' export default 1',
  }, {
    template: '→ {{json (trim code)}}',
  })
  expect(result).toBe('→ "export default 1"')
})
test('renderPrompt (multiple items)', () => {
  const result = renderPrompt({
    items: [
      {
        code: 'a',
      },
      {
        code: 'b',
      },
    ],
  }, {
    template: '{{#each items}}{{@index}}: {{code}}{{#unless @last}}{{blankLine}}{{/unless}}{{/each}}',
  })
  expect(result).toBe('0: a\n\n1: b')
})
