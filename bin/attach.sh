#!/usr/bin/env bash
# Attach Thally Track to a product repo, wired to an existing Thally docs
# repo checkout. Thin wrapper around the `thally track` CLI (this does not
# reimplement Track) plus the bookkeeping it doesn't do for you: finding the
# docs repo's owner/repo from its git remote, and telling you exactly which
# file to copy where and which secrets to add.
#
# Usage: attach.sh <product-owner/repo> <docs-repo-path> [--paths csv] [--branch name]
set -euo pipefail

usage() {
  echo "Usage: attach.sh <product-owner/repo> <docs-repo-path> [--paths a,b,c] [--branch name]" >&2
}

product_spec=${1:-}
docs_path=${2:-}
[ -n "$product_spec" ] && [ -n "$docs_path" ] || { usage; exit 1; }
shift 2

if [[ ! "$product_spec" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
  echo "error: '$product_spec' is not a valid <owner/repo>" >&2
  exit 1
fi
product_repo=${product_spec#*/}

paths=""
branch=""
while [ $# -gt 0 ]; do
  case "$1" in
    --paths) paths=$2; shift 2 ;;
    --branch) branch=$2; shift 2 ;;
    *) echo "error: unknown option '$1'" >&2; usage; exit 1 ;;
  esac
done

[ -d "$docs_path" ] || { echo "error: docs repo path not found: $docs_path" >&2; exit 1; }
docs_path=$(cd "$docs_path" && pwd)
[ -f "$docs_path/docs.json" ] || { echo "error: $docs_path does not look like a Thally docs repo (no docs.json)" >&2; exit 1; }

# Locate the thally CLI: prefer the docs repo's own pinned copy.
thally_bin=""
for candidate in \
  "$docs_path/.github/thally-tooling/node_modules/.bin/thally" \
  "$docs_path/node_modules/.bin/thally"
do
  if [ -x "$candidate" ]; then thally_bin=$candidate; break; fi
done
if [ -z "$thally_bin" ] && command -v thally >/dev/null 2>&1; then
  thally_bin=$(command -v thally)
fi
if [ -z "$thally_bin" ]; then
  echo "error: thally CLI not found. Expected it at:" >&2
  echo "  $docs_path/.github/thally-tooling/node_modules/.bin/thally" >&2
  echo "or on PATH. Run npm install in the docs repo's tooling dir first." >&2
  exit 1
fi

# Docs repo owner/repo, from its git remote.
remote_url=$(git -C "$docs_path" remote get-url origin 2>/dev/null) || {
  echo "error: could not read git remote 'origin' in $docs_path" >&2
  exit 1
}
docs_owner_repo=$(printf '%s' "$remote_url" | sed -E 's#^git@github\.com:##; s#^https?://github\.com/##; s#\.git$##')
if [[ ! "$docs_owner_repo" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
  echo "error: could not parse <owner>/<repo> from docs remote: $remote_url" >&2
  exit 1
fi

track_add_args=(track add "$product_spec")
[ -n "$paths" ] && track_add_args+=(--paths "$paths")
[ -n "$branch" ] && track_add_args+=(--branch "$branch")

echo "==> $thally_bin ${track_add_args[*]}"
( cd "$docs_path" && "$thally_bin" "${track_add_args[@]}" )

echo
echo "==> $thally_bin track setup --repo $docs_owner_repo --write"
( cd "$docs_path" && "$thally_bin" track setup --repo "$docs_owner_repo" --write )

sender_file="$docs_path/thally-track-sender-${product_repo}.yml"
# thally track setup writes directory paths verbatim ('src/api'), but GitHub's
# on.pull_request.paths filter only matches files inside a directory with 'src/api/**'.
if [ -f "$sender_file" ]; then
  sed -E -i.bak "s#^( +- ')([^'*]*/)?([^'*./]+)'\$#\1\2\3/**'#" "$sender_file" && rm -f "$sender_file.bak"
fi
echo
echo "-----------------------------------------------------------------"
echo "Next steps:"
echo
if [ -f "$sender_file" ]; then
  echo "1. Copy the sender workflow into the product repo:"
  echo "     $sender_file"
  echo "   -> <product-repo>/.github/workflows/thally-track.yml"
else
  echo "1. (expected sender workflow was not found at $sender_file — check the"
  echo "   'thally track setup' output above)"
fi
echo
echo "2. Add these secrets by hand (thally track setup prints this too):"
echo "     - $docs_owner_repo (docs repo):     ANTHROPIC_API_KEY"
echo "       (consumed by .github/workflows/thally-agent.yml to run the docs agent)"
echo "     - $product_spec (product repo):  THALLY_DISPATCH_TOKEN"
echo "       (a token with 'repo' dispatch access to $docs_owner_repo; consumed by"
echo "        the sender workflow you just copied over)"
echo "-----------------------------------------------------------------"
