# thally check --drift after product merges

Command: `thally check --drift --ci .` (@thallylabs/cli 0.8.40), run in a worktree of vaibhav700c/gitlite at 9fbdc19 (merge of #2; #1 merged as 62dcfb6), with docs.json and src/content copied from vaibhav700c/gitlite-docs@d6b651f. Pages were verified against verifiedCommit 5d969a4. The openapi.yaml error comes from not copying that file into the worktree.

```
::warning file=src/content/api/issues.mdx::Drift: source "services/auth/oauth2.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/issues.mdx::Drift: source "modules/setting/api.go" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/issues.mdx::Drift: source "templates/swagger/v1_json.tmpl" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/organizations.mdx::Drift: source "services/auth/oauth2.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/organizations.mdx::Drift: source "templates/swagger/v1_json.tmpl" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/repositories.mdx::Drift: source "services/auth/oauth2.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/repositories.mdx::Drift: source "modules/setting/api.go" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/api/repositories.mdx::Drift: source "templates/swagger/v1_json.tmpl" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/authentication.mdx::Drift: source "services/auth/oauth2.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/authentication.mdx::Drift: source "modules/auth/httpauth/httpauth.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/authentication.mdx::Drift: source "routers/api/v1/api.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/authentication.mdx::Drift: source "templates/swagger/v1_json.tmpl" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/deployment.mdx::Drift: source "custom/conf/app.example.ini" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/errors.mdx::Drift: source "services/context/api.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/errors.mdx::Drift: source "routers/api/v1/api.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/errors.mdx::Drift: source "services/auth/oauth2.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/errors.mdx::Drift: source "templates/swagger/v1_json.tmpl" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/rate-limits.mdx::Drift: source "modules/setting/api.go" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/rate-limits.mdx::Drift: source "custom/conf/app.example.ini" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/guides/webhooks.mdx::Drift: source "custom/conf/app.example.ini" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/introduction.mdx::Drift: source "NOTICE.md" changed in 5 commit(s) since it was verified — this page may be stale.
::warning file=src/content/introduction.mdx::Drift: source "routers/api/v1/api.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/pagination.mdx::Drift: source "modules/setting/api.go" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/pagination.mdx::Drift: source "services/context/api.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/pagination.mdx::Drift: source "custom/conf/app.example.ini" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/quickstart.mdx::Drift: source "services/auth/oauth2.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/quickstart.mdx::Drift: source "modules/auth/httpauth/httpauth.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/quickstart.mdx::Drift: source "routers/api/v1/api.go" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/quickstart.mdx::Drift: source "templates/swagger/v1_json.tmpl" changed in 1 commit(s) since it was verified — this page may be stale.
::warning file=src/content/reference/configuration-api.mdx::Drift: source "modules/setting/api.go" changed in 2 commit(s) since it was verified — this page may be stale.
::warning file=src/content/reference/configuration-api.mdx::Drift: source "custom/conf/app.example.ini" changed in 2 commit(s) since it was verified — this page may be stale.
::error file=openapi.yaml::API reference points at "openapi.yaml" but the file does not exist
thally check: 1 error(s), 31 warning(s)
```
