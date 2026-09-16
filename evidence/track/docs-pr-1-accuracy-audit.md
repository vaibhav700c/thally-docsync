# Accuracy audit of Thally Track docs PR vaibhav700c/gitlite-docs#1 (commit fb17ba5)

A read-only review of every claim in the diff against GitLite source at merge c890207. Done by a Claude Code subagent on 2026-09-16, after the PR was merged.

## Correct
- `Bearer` is the documented scheme in authentication and quickstart. `GITLITE_AUTH` is updated. The schemes are case-insensitive (modules/auth/httpauth/httpauth.go).
- The `Deprecation`, `Sunset`, and `Warning` header values match services/auth/oauth2.go exactly.
- `ALLOW_LEGACY_TOKEN_SCHEME`: default `true`, and the 401 message when `false` is exact (oauth2.go, modules/setting/api.go, routers/api/v1/api.go apiAuth). Documented in authentication, errors, and configuration-api.
- Paging defaults 20/25 are correct in pagination, rate-limits, and configuration-api, including the example JSON and the `app.ini` sample.
- configuration-api correctly says `/settings/api` does not expose `ALLOW_LEGACY_TOKEN_SCHEME` (modules/structs/settings.go).
- Control pages (introduction, webhooks, deployment) and api/* reference pages were correctly left untouched.
- No MDX syntax errors.

## Wrong or overstated
- pagination: "`X-Page`, `X-PerPage`, and `X-HasMore` are set on every paginated response" is overstated. They are set only by `SetLinkHeader` (services/context/api.go), and at least one paginated endpoint does not call it (routers/api/v1/repo/wiki.go `// FIXME: SetLinkHeader missing`).
- pagination: the example `Access-Control-Expose-Headers` order is wrong. The actual order is `Link, X-Page, X-PerPage, X-HasMore, X-Total-Count`, because `SetLinkHeader` runs before `SetTotalCountHeader`.
- pagination and configuration: header names are written `X-PerPage` and `X-HasMore`. On HTTP/1.1, Go canonicalizes them to `X-Perpage` and `X-Hasmore`. The names are case-insensitive, but the docs do not match raw `curl -i` output.

## Missed
- `lastVerified` and `verifiedCommit` frontmatter were not updated on any of the 6 changed pages, although AGENTS.md asks for it.
- No changelog entry for the breaking change. AGENTS.md told the agent not to edit changelog.mdx (maintainers own release notes), so this is a maintainer task, not a Thally miss.
