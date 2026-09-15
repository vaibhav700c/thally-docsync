#!/usr/bin/env bash
# Save raw copies of the agent-facing surfaces of a docs site (llms.txt,
# authentication/pagination pages, agent-readiness score, MCP tool calls) so
# a before/after diff can prove docs actually changed, not just that
# example commands still run.
#
# Usage: capture-surfaces.sh <site-origin> <out-dir> [options]
#   --page <id>        Page id to capture via MCP read_page (repeatable, default: authentication, pagination)
#   --query <text>      Query for the MCP search_docs call (default: "how do I authenticate with the GitLite API?")
set -euo pipefail

site=${1:?site origin}
out=${2:?output directory}
shift 2

query="how do I authenticate with the GitLite API?"
pages=()
while [ $# -gt 0 ]; do
  case "$1" in
    --page) pages+=("$2"); shift 2 ;;
    --query) query=$2; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done
[ ${#pages[@]} -eq 0 ] && pages=(authentication pagination)

mkdir -p "$out"

mcp() {
  curl -s -X POST "$site/api/mcp" -H 'Content-Type: application/json' \
    -H 'Accept: application/json, text/event-stream' -d "$1"
}

curl -s "$site/llms.txt" >"$out/llms.txt"
curl -s "$site/authentication.md" >"$out/authentication.md"
curl -s "$site/pagination.md" >"$out/pagination.md"
curl -s "$site/api/agent-readiness" >"$out/agent-readiness.json"

mcp "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"search_docs\",\"arguments\":{\"query\":\"$query\"}}}" >"$out/mcp-search.json"
id=2
for page in "${pages[@]}"; do
  mcp "{\"jsonrpc\":\"2.0\",\"id\":$id,\"method\":\"tools/call\",\"params\":{\"name\":\"read_page\",\"arguments\":{\"pageId\":\"$page\"}}}" >"$out/mcp-read-${page//\//_}.json"
  id=$((id + 1))
done

{
  echo "site: $site"
  echo "captured_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "files:"
  for f in "$out"/*; do [ "$(basename "$f")" = capture.txt ] || echo "  - $(basename "$f") $(shasum -a 256 "$f" | cut -c1-16)"; done
} >"$out/capture.txt"

echo "Authorization scheme mentions:"
grep -ho 'Authorization: [A-Za-z]*' "$out/authentication.md" "$out"/mcp-read-*.json 2>/dev/null | sort | uniq -c || true
echo "Default page size mentions:"
grep -ho 'default of `[0-9]*`\|| `limit` | integer | `[0-9]*`' "$out/pagination.md" 2>/dev/null | sort | uniq -c || true
