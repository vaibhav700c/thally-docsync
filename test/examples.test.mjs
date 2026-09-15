import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  extractBlocks,
  shouldSkip,
  rewriteCurlArgs,
  parseStatuses,
  decide,
  mergeConfig,
} from '../lib/examples.mjs'

test('extracts indented code fences (e.g. inside <Tab>)', () => {
  const src = [
    '<Tabs>',
    '  <Tab title="bash">',
    '    ```bash',
    '    curl -s http://localhost:3000/api/v1/user',
    '    ```',
    '  </Tab>',
    '</Tabs>',
  ].join('\n')
  const blocks = extractBlocks(src, ['bash', 'js'])
  assert.equal(blocks.length, 1)
  assert.equal(blocks[0].lang, 'bash')
  // dedented back to column 0, no leftover indent
  assert.equal(blocks[0].code, 'curl -s http://localhost:3000/api/v1/user\n')
})

test('skips bash blocks missing the required command', () => {
  const config = mergeConfig({})
  assert.equal(shouldSkip('bash', 'echo hello', config), true)
  assert.equal(shouldSkip('bash', 'curl -s http://x', config), false)
})

test('skipIfContains skips placeholder samples', () => {
  const config = mergeConfig({})
  assert.equal(shouldSkip('bash', 'curl -H "Authorization: <your-token>"', config), true)
  assert.equal(shouldSkip('js', 'fetch("<your-url>")', config), true)
})

test('allowedStatuses permits documented error codes for a page', () => {
  const config = mergeConfig({})
  assert.equal(decide({ exitCode: 0, statuses: [401], page: 'guides/errors', config }), true)
  assert.equal(decide({ exitCode: 0, statuses: [401], page: 'quickstart', config }), false)
})

test('a sample with its own -w keeps it and still gets the status marker appended', () => {
  const rewritten = rewriteCurlArgs(['-s', '-w', '%{time_total}\\n', 'http://x'])
  assert.deepEqual(rewritten, ['-s', '-w', '%{time_total}\\n%{stderr}__STATUS:%{http_code}\n', 'http://x'])
  // no -w at all: one gets appended
  const appended = rewriteCurlArgs(['-s', 'http://x'])
  assert.deepEqual(appended, ['-s', 'http://x', '-w', '%{stderr}__STATUS:%{http_code}\n'])
})

test('parseStatuses reads every __STATUS marker from shim stderr', () => {
  assert.deepEqual(parseStatuses('__STATUS:200\nsome noise\n__STATUS:404\n'), [200, 404])
})

test('no statuses recorded is always a failure, even with exit 0', () => {
  assert.equal(decide({ exitCode: 0, statuses: [], page: 'quickstart', config: mergeConfig({}) }), false)
})
