# SYNCHACK submission draft

Event: [SYNCHACK on MastryHub](https://mastryhub.com/event/synchack). The event page lists submissions as closing **Sep 15, 2026, 11:55 PM**.

Items marked `[TODO]` need a link or an action that only the team can provide. Items marked `[AFTER TRACK RUN]` must be written from what actually happened. Do not fill them in advance.

## Form fields

| Field | Answer |
| --- | --- |
| Project Title | GitLite Docs: keeping API docs current with Thally Track |
| Code Repository | https://github.com/vaibhav700c/thally-docsync (the built system; links to the product and docs repos below) |
| GitHub | Connect the account `vaibhav700c` in the form |
| Demo Video | `[TODO]` Unlisted YouTube or Loom link, 5 minutes or less |
| Live Project Link | `[TODO]` `https://<site>.thally.app` |
| Following Thally on X and LinkedIn | `[TODO]` Answer "yes" only after you actually follow both accounts |
| Public post on X | `[TODO]` |
| Public post on LinkedIn | `[TODO]` |
| Feedback | See [Feedback](#feedback) |
| Track | Keep product knowledge current. The event page calls it "Track 1" in the track description and "Track 2" in the prize list, so write the name as well as the number. |
| Notes | See [Notes](#notes) |

## Repositories, commits, and pull requests

| What | Link |
| --- | --- |
| Product repository (fork of Gitea v1.27.3) | https://github.com/vaibhav700c/gitlite |
| Docs repository (Thally site source) | https://github.com/vaibhav700c/gitlite-docs |
| Kit and evidence (this repo) | https://github.com/vaibhav700c/thally-docsync |
| Fork baseline commit | https://github.com/vaibhav700c/gitlite/commit/5d969a41a0ffde424f45c730f0a6928bc5dae56f |
| Track sender workflow commit | https://github.com/vaibhav700c/gitlite/commit/52320745e8155882a52cd865670e078395aa487b |
| Product change, part A (token scheme deprecation) | https://github.com/vaibhav700c/gitlite/commit/ac4bffacc37a145e656e859b58d4019cc67978f7 |
| Product change, part B (paging defaults and headers) | https://github.com/vaibhav700c/gitlite/commit/300d307a213e890eb80f447c08f15bc8e356a32d |
| Product PR | `[TODO]` |
| Track docs PR | `[AFTER TRACK RUN]` |
| Deployment preview reviewed | `[AFTER TRACK RUN]` |

## Feedback

Worked:
- `create-thally-docs --yes --install` produced a site that passed `thally check`, 431 unit tests, and a production build before any content existed.
- Agent surfaces (`/llms.txt`, `.md` pages, `/api/mcp`, `/api/agent-readiness`) worked locally with no configuration. The readiness score was 100 on 13 pages.
- `sources` and `verifiedCommit` frontmatter gave a clean way to tie pages to product files. The runtime strips those keys from public output.
- The open-source Track path (`thally track add`, `thally track setup`, and the `thally-agent.yml` workflow) needs no hosted server.

Did not work, or surprised us:
- `thally track setup` writes `paths:` entries as bare directories (`'services/auth'`). GitHub's `pull_request.paths` filter does not match files inside a bare directory, so the sender workflow would never fire. We changed the entries to `'services/auth/**'`, and `bin/attach.sh` in this repo applies that fix automatically.
- `thally deploy --help` ignores `--help` and starts a real production build. Its fallback deploy step calls `npx vercel deploy`.
- Putting `api: { source }` on the tab that holds the content pages hides every page on that tab from `/llms.txt`, because llms.txt skips API tabs. Nothing warns about this. The starter's own llms.txt test caught it.
- The MCP `search_docs` tool ranked Introduction above Authentication for "how do I authenticate".
- `[AFTER TRACK RUN]` Add what Track detected, missed, or overstated.

Useful in general: `[AFTER TRACK RUN]`

## Reflection (required by the event)

- What did you accomplish? `[AFTER TRACK RUN]`
- When did Thally first become useful? `[AFTER TRACK RUN]`
- What took more manual work than expected? Wiring Track without the Cloud GitHub App: the sender workflow's path filters, the secrets, and the repository setting that lets Actions open pull requests.
- What result did you trust least? `[AFTER TRACK RUN]`
- How did you verify that result? `[AFTER TRACK RUN]` For example, run `curl -si -H "Authorization: token $T"` against the merged build and compare the headers with the proposed docs.
- Would you use Thally for your next real release? `[AFTER TRACK RUN]`

## Notes

- **Fork disclosure:** GitLite is a fork of Gitea, an existing MIT-licensed open-source project, and is not affiliated with it. The built work is the documentation site, the Thally Track integration, and this kit. `NOTICE.md` in the gitlite repository lists every change made to upstream.
- **AI assistance disclosure:** Claude Code (Anthropic) wrote most of the code, documentation, and verification tooling, directed and reviewed by the team. The Thally docs agent drafts the Track PR, using Anthropic models through the team's own API key. Human review decisions on that PR are the team's.
- **Third-party assets:** Gitea source (MIT), the create-thally-docs starter (MIT), and no third-party images or logos.
- **Team members:** `[TODO]` Names for team GOLU (the event page shows 2 of 4 seats filled).

## Suggested public post (edit before posting)

> Built for #SYNCHACK with @Thally: docs that follow the product.
>
> I forked Gitea as "GitLite" and shipped a breaking-adjacent API change: `Authorization: token` is deprecated in favor of Bearer, and page size dropped from 30 to 20. Thally Track picked up the merged PR and opened a docs PR for review. I checked the proposal against the running server before merging.
>
> The part that surprised me: all 49 code examples in the docs still passed after the change. Tests alone would never have flagged the stale pages.
>
> `[screenshot or video]` · `[live site link]` · https://github.com/vaibhav700c/thally-docsync

## Video script (5 minutes or less)

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:15 | kit README first paragraph | "GitLite is a fork of Gitea, an existing open-source project. What we built is the documentation system and the Thally Track integration." |
| 0:15–0:50 | Live site: Quickstart, Authentication, Pagination | Docs written against the real product: `token` scheme, 30 per page. |
| 0:50–1:20 | Terminal: `evidence/product/docs-examples-before.md` and `docs-examples-after-product-change.md` | 49/49 examples pass before and after the change, so tests alone never catch stale docs. |
| 1:20–2:00 | Product PR diff (oauth2.go, setting/api.go, swagger) and merge | The loud change (auth scheme) and the quiet one (paging defaults). |
| 2:00–2:20 | gitlite Actions tab: "Thally track dispatch" run, then gitlite-docs "Thally docs agent" run | How Track wires in with no hosted server. |
| 2:20–3:40 | Track docs PR in the GitHub UI and its deploy preview | Accept, edit, and reject decisions, said out loud. Run `curl -si -H "Authorization: token $T"` and show the `Deprecation` header before approving. |
| 3:40–4:20 | Split screen of the MCP `read_page authentication` result, before and after | The machine-readable docs that agents read were stale too, until the change went through review. |
| 4:20–5:00 | Reflection | What Thally got right, what it missed or overstated, what was verified by hand. |
