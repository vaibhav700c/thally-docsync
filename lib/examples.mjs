// Pure logic for bin/verify-examples.mjs — no I/O, no process, no child_process.
// Kept separate so it can be unit-tested with `node --test` without a live server.

// Extract fenced code blocks for the given languages, tolerating indentation
// (e.g. code fences nested inside an MDX <Tab> block), and dedent each block
// to the fence's own indent level.
export function extractBlocks(src, languages) {
  const pattern = new RegExp(`^[ \\t]*\`\`\`(${languages.join('|')})\\n([\\s\\S]*?)^[ \\t]*\`\`\``, 'gm')
  const blocks = []
  for (const match of src.matchAll(pattern)) {
    const [, lang, raw] = match
    const indent = raw.match(/^[ \t]*/)[0]
    const code = dedent(raw, indent)
    blocks.push({ lang, code })
  }
  return blocks
}

export function dedent(raw, indent) {
  if (!indent) return raw
  return raw
    .split('\n')
    .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
    .join('\n')
}

// Whether a block should be skipped before ever running it: missing a
// required command (e.g. bash without curl) or containing a placeholder
// marker (e.g. "<your-token>") that means it's illustrative, not runnable.
export function shouldSkip(lang, code, config) {
  const requireCmd = config.requireCommand?.[lang]
  if (requireCmd && !code.includes(requireCmd)) return true
  if ((config.skipIfContains ?? []).some((needle) => code.includes(needle))) return true
  return false
}

// Rewrite a curl argv so every invocation reports its status on stderr.
// curl only honors the LAST -w it sees, so an existing -w is extended
// in place rather than overridden by appending a second one.
export function rewriteCurlArgs(args) {
  const out = []
  let foundW = false
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '-w') {
      foundW = true
      out.push(a)
      if (i + 1 < args.length) {
        out.push(args[i + 1] + '%{stderr}__STATUS:%{http_code}\n')
        i++
      }
      continue
    }
    out.push(a)
  }
  if (!foundW) out.push('-w', '%{stderr}__STATUS:%{http_code}\n')
  return out
}

// Bash function definition that shadows `curl`, rewriting args per
// rewriteCurlArgs's rule, then running the real curl.
export function curlShimScript() {
  return `curl() {
  local args=() found= next=
  for a in "$@"; do
    if [ -n "$next" ]; then args+=("$a%{stderr}__STATUS:%{http_code}\\n"); next=; continue; fi
    [ "$a" = "-w" ] && { found=1; next=1; }
    args+=("$a")
  done
  [ -z "$found" ] && args+=(-w "%{stderr}__STATUS:%{http_code}\\n")
  command curl "\${args[@]}"
}
`
}

// Node --import shim: wraps global fetch to report each response status on
// stderr the same way the curl shim does, so js samples get the same signal.
export function fetchShimScript() {
  return `const f = globalThis.fetch
globalThis.fetch = async (...a) => { const r = await f(...a); process.stderr.write('__STATUS:' + r.status + '\\n'); return r }
`
}

export function parseStatuses(stderr) {
  return [...stderr.matchAll(/__STATUS:(\d+)/g)].map((m) => Number(m[1]))
}

// Pass/fail decision for one executed sample: must exit 0, must have
// recorded at least one status (silence is a failure, not a pass), and
// every recorded status must be 2xx or explicitly allowed for that page.
export function decide({ exitCode, statuses, page, config }) {
  const allowed = config.allowedStatuses?.[page] ?? []
  return exitCode === 0 && statuses.length > 0 && statuses.every((s) => (s >= 200 && s < 300) || allowed.includes(s))
}

export const DEFAULT_CONFIG = {
  contentDir: 'src/content',
  nav: 'docs.json',
  languages: ['bash', 'js'],
  requireCommand: { bash: 'curl' },
  allowedStatuses: { 'guides/errors': [401, 404] },
  skipIfContains: ['<your'],
  report: 'verify/report-{label}.md',
}

export function mergeConfig(userConfig) {
  return { ...DEFAULT_CONFIG, ...userConfig }
}
