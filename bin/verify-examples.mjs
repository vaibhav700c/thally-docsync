#!/usr/bin/env node
// Runs every curl/js sample embedded in a Thally docs site's content, against
// an already-running product server, and writes a pass/fail report.
//
// Usage: verify-examples.mjs [label] [--config path] [--help]
//
// Config file (default: docsync.config.json in cwd), all fields optional:
//   {
//     "contentDir": "src/content",
//     "nav": "docs.json",
//     "languages": ["bash", "js"],
//     "requireCommand": { "bash": "curl" },
//     "allowedStatuses": { "guides/errors": [401, 404] },   (default: {})
//     "skipIfContains": ["<your"],
//     "report": "verify/report-{label}.md"
//   }
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import {
  extractBlocks,
  shouldSkip,
  curlShimScript,
  fetchShimScript,
  parseStatuses,
  decide,
  mergeConfig,
} from '../lib/examples.mjs'

function printHelp() {
  process.stdout.write(`Usage: verify-examples.mjs [label] [--config <path>]

Runs every code sample in a Thally docs site's navigation against an
already-running product server and writes a pass/fail report.

  label            Report label, used in the output filename (default: run)
  --config <path>  Path to docsync.config.json (default: ./docsync.config.json)
  --help, -h       Show this help

Config defaults (all overridable in docsync.config.json):
  contentDir       "src/content"
  nav              "docs.json"
  languages        ["bash", "js"]
  requireCommand   { "bash": "curl" }
  allowedStatuses  {}   (e.g. { "guides/errors": [401, 404] })
  skipIfContains   ["<your"]
  report           "verify/report-{label}.md"
`)
}

function main(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp()
    return 0
  }
  const configIdx = argv.indexOf('--config')
  const configPath = configIdx !== -1 ? argv[configIdx + 1] : 'docsync.config.json'
  const positionals = argv.filter((a, i) => a !== '--config' && argv[i - 1] !== '--config' && !a.startsWith('-'))
  const label = positionals[0] ?? 'run'

  const userConfig = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {}
  const config = mergeConfig(userConfig)

  const nav = JSON.parse(readFileSync(config.nav, 'utf8'))
  const pages = nav.tabs.flatMap((t) => t.groups ?? []).flatMap((g) => g.pages)

  const dir = mkdtempSync(join(tmpdir(), 'docsync-samples-'))
  const fetchShim = join(dir, 'shim.mjs')
  writeFileSync(fetchShim, fetchShimScript())
  const curlShim = curlShimScript()

  const rows = []
  for (const page of pages) {
    const file = join(config.contentDir, `${page}.mdx`)
    if (!existsSync(file)) continue
    const src = readFileSync(file, 'utf8')
    let index = 0
    for (const { lang, code } of extractBlocks(src, config.languages)) {
      if (shouldSkip(lang, code, config)) continue
      index++
      const outFile = join(dir, `${page.replaceAll('/', '_')}-${index}.${lang === 'js' ? 'mjs' : 'sh'}`)
      writeFileSync(outFile, lang === 'js' ? code : curlShim + code)
      const run =
        lang === 'js'
          ? spawnSync('node', ['--import', fetchShim, outFile], { encoding: 'utf8', timeout: 30000 })
          : spawnSync('bash', [outFile], { encoding: 'utf8', timeout: 30000 })
      const statuses = parseStatuses(run.stderr ?? '')
      const ok = decide({ exitCode: run.status, statuses, page, config })
      const firstLine = code.trim().split('\n')[0].slice(0, 70)
      rows.push({ page, index, lang, command: firstLine, exit: run.status, statuses, ok })
      if (!ok) console.error(`FAIL ${page}#${index}\n${run.stdout}\n${run.stderr}`)
    }
  }

  const passed = rows.filter((r) => r.ok).length
  let version = ''
  try {
    version = execFileSync('curl', ['-s', 'http://localhost:3000/api/v1/version'], { encoding: 'utf8', timeout: 5000 }).trim()
  } catch {
    version = '(version endpoint unavailable)'
  }
  const table = [
    `# Example verification: ${label}`,
    '',
    `Captured ${new Date().toISOString()} against ${version}. ${passed}/${rows.length} passed.`,
    '',
    '| Page | # | Lang | Command | Exit | Status | Result |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows.map(
      (r) =>
        `| ${r.page} | ${r.index} | ${r.lang} | \`${r.command.replaceAll('|', '\\|')}\` | ${r.exit} | ${r.statuses.join(', ')} | ${r.ok ? 'pass' : 'FAIL'} |`,
    ),
    '',
  ].join('\n')

  const reportPath = config.report.replace('{label}', label)
  mkdirSync(dirname(reportPath), { recursive: true })
  writeFileSync(reportPath, table)
  console.log(`${passed}/${rows.length} passed; wrote ${reportPath}`)
  return passed === rows.length ? 0 : 1
}

process.exit(main(process.argv.slice(2)))
