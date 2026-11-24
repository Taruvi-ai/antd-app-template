# AGENTS.md — Taruvi Refine Template (Ant Design)

Shared guidance for any AI agent or IDE (Claude Code, Codex, Kiro, …) working in
this repo. Claude Code users: [`CLAUDE.md`](CLAUDE.md) adds the subagent
orchestration layer on top of this.

## Functional app default

If the user asks to build an app, default to a **functional, production-ready**
app — not a mockup, demo, or MVP. That means: create the Taruvi schema, register
Refine resources in `src/App.tsx`, build real list/create/edit/show flows, and
wire dashboards to **live data** (computed from the system, never hardcoded).
Only build a UI-only prototype if the user explicitly asks for one.

This is a **Refine.dev v5** project (React admin/dashboard framework). Even if the
user asks for plain HTML/CSS/JS, always use React + Refine v5 + Ant Design (antd) + TypeScript.

## Plan before building

**Clarify only what changes the shape of the build.** If the request doesn't say
whether it needs role-based access control beyond default auth, scheduled/
automated jobs, external API integrations, or reporting/analytics beyond a
simple filtered list, ask before planning — these decide whether the backend
touches Cerbos policies, roles, functions, or analytics **at all**, and guessing
wrong here costs a rebuild, not a tweak. Don't ask about things a sensible
default already covers (field types, page layout, naming) — that's surveying,
not clarifying.

**Write a short spec before building — save it to `docs/spec.md`.** It lists
each resource, its fields/types/relations, provider `meta` (which
`dataProviderName`, `bucketName`, function slugs), and the page list per resource
(list / show / create-edit / dashboard). This is what prevents rework on a real
build — don't skip it, whether you're building sequentially yourself or
coordinating multiple agents.

**Scope it to what this build needs — not every backend capability that
exists.** Plain datatables + default auth are the baseline; add nothing else
unless clarified as needed:
- **Cerbos policies / custom roles** — only for multi-role access control. The
  template ships `accessControlProvider` commented out in `src/App.tsx` for
  exactly this reason; most apps never uncomment it.
- **Functions** — only when the skill's decision criteria apply (2+ resources at
  runtime, event triggers, cron, external API + a stored secret, >30s work, a
  public endpoint, complex authz, or a function pipeline). A plain CRUD resource
  never needs one.
- **Analytics queries** — only if reporting/dashboards beyond a simple filtered
  list were asked for.

An unrequested policy or function isn't neutral — it's dead weight every future
change has to route around. When genuinely unsure whether something's needed,
ask — don't default to yes.

## Mandatory Taruvi preflight

For anything touching Taruvi, `@taruvi/sdk`, or `@taruvi/refine-providers`, **read
the relevant skill before writing code** — do not implement from memory:

- **Backend** (schema, Cerbos policies, roles/users, buckets, secrets, analytics,
  raw SQL, Python functions): `.agents/skills/taruvi-app-developer/SKILL.md`
- **Frontend** (Refine providers, hooks, list/dashboard/form UX, auth, access
  control): `.agents/skills/taruvi-refine-providers/SKILL.md`

Each SKILL.md routes you to its module references. If the skills are missing,
install them: `npx skills add Taruvi-ai/taruvi-skills`. They install automatically
(latest) via `postinstall` on every `npm install`, so they are not committed to
the repo — a bare clone without installing won't have them.

The skills are the source of truth for **Refine v5 syntax**, provider `meta`
options, hook return shapes, and production UX patterns. Don't duplicate that here
— open the skill.

## Mandatory UI / design-system preflight

For anything that renders or styles UI:

1. **Ant Design first.** Before implementing anything antd-related, use the
   **antd MCP server** (or the `@ant-design/cli`) as the primary reference. If
   unavailable, use the local fallback [`docs/antd-reference.md`](docs/antd-reference.md).
2. **Check for a local `DESIGN.md` first** (this app's own brand, at this repo's
   root). If one exists, read it — it defines this app's actual token values.
   **This template ships brand-neutral by default — there is no Taruvi-brand
   fallback.** If none exists, skip it; style from whatever is in
   [`src/theme/themeOptions.ts`](src/theme/themeOptions.ts) (plain antd defaults
   out of the box) until this app defines its own `DESIGN.md`.

   `UX.md` (behavioral standards, page patterns — not brand-specific) is always
   fetched fresh, since it's generic enterprise-app guidance:
   `https://raw.githubusercontent.com/Taruvi-ai/ui-guidelines/main/UX.md`
3. Import design tokens from `src/theme/themeOptions.ts` (`taruviTokens`) or read
   them with antd's `theme.useToken()`. **Never** hardcode brand hex values.
4. Prefer plain antd components — the `ConfigProvider` theme (set up in
   `src/contexts/color-mode`) already applies tokens for color, radius, type and
   dark mode. Don't re-style with inline styles/CSS where a token or component
   prop covers it.
5. Use icons from `@ant-design/icons` (prefer the `Outlined` set).
6. **Page anatomy is mandatory** (details in the fetched guidelines + the
   frontend skill): list pages need search + filters + active-filter tags +
   server-side pagination + empty states (use [`ListPageShell`](src/components/ListPageShell.tsx));
   show pages need breadcrumb + title + status tag + actions + meta; destructive
   actions need a confirmation (`Popconfirm`/`Modal`) naming the item; never
   render a blank page during load (`Skeleton`/`Spin`). Filters push into
   Refine's server-side `filters[]`, never React state.

If the guidelines fetch fails or `src/theme/themeOptions.ts` is missing, stop and
tell the user.

## User data access rule (mandatory)

Taruvi provides built-in user management (users, roles, auth). **Never** create
custom identity tables (`users`, `auth_users`, `user_roles`, `passwords`,
`sessions`), never access `auth_user` via datatable routes, and never use
`resource: "auth_user"` in Refine hooks. Always use the `user` provider
(`dataProviderName: "user"`, `resource: "users"`) and the user/role APIs +
MCP tools (`list_users`, `create_user`, `manage_roles`,
`manage_role_assignments`). If identity data isn't available to the current role,
degrade gracefully in the UI.

## Repo-specific rules

- **Notifications:** use the existing `useNotificationProvider` from
  `@refinedev/antd` (configured in `src/App.tsx`, inside antd's `<App>`). No
  custom `message`/`notification` systems or ad hoc toasts.
- **Refine + antd forms:** use the instance from `useForm` (`formProps.form`) —
  never call `Form.useForm()` and pass `form={form}` after spreading `formProps`
  (it replaces Refine's instance → "useForm is not connected to any Form element").
  Copy `src/pages/examples/{create,edit}.tsx`.
- **antd v5 on React 19:** `@ant-design/v5-patch-for-react-19` is imported first in
  `src/index.tsx`; keep it. `Menu` with `inlineCollapsed` must set `mode="inline"`.
- **Forms use Zod.** All new/changed forms (create, edit, filters, any user
  input) validate with a **Zod** schema wired to the antd `Form` — see
  `src/pages/examples/formSchema.ts` + `zodFormErrors.ts`. Use the Zod MCP server
  as the primary reference; fallback [`docs/zod-reference.md`](docs/zod-reference.md).
  Error text shown in the UI must come from the Zod flow, not inline rules.
- **Auth is redirect-based:** keep `/login` wired to `LoginRedirect`; don't
  replace it with a local form. Keep protected Taruvi queries behind auth —
  app-wide settings/nav/theme fetches must skip protected calls until a session
  token exists.
- **Form inputs:** normalize nullable API values before passing them to antd
  inputs (`?? ""`, boolean `checked`) to avoid controlled/uncontrolled warnings.
- **Stable query inputs:** memoize `filters`/`sorters`/`meta`; avoid inline
  `new Date()`/`Date.now()`/`Math.random()` in hook args — unstable inputs change
  the query key and cause repeated datatable requests.
- **Dev server is already running** — do **not** run `npm run dev`/`build`.
  Changes hot-reload. Only build when explicitly asked.
- **Browser errors → `logs/frontend.ndjson`.** When the user reports a browser
  problem, read this file (NDJSON, one event per line) instead of asking them to
  open DevTools. After shipping a fix, truncate it (`: > logs/frontend.ndjson`)
  before asking them to re-test. Missing file = nothing captured yet.

## Quick reference

**Paths:** App `src/App.tsx` · Providers `src/providers/refineProviders.ts` ·
Client `src/taruviClient.ts` · Pages `src/pages/{resource}/` · Components
`src/components/` · Theme `src/theme/themeOptions.ts` · Env `.env`

**Examples to copy from (CRUD baseline):** `src/pages/examples/{list,create,edit}.tsx`
(+ `formSchema.ts`, `zodFormErrors.ts`, `can-access.tsx`, `frontend-filtering.tsx`,
`public-protected-pages.tsx`). Copy these patterns before building any new CRUD page.

**Resource dir layout:** `list.tsx` · `create.tsx` · `edit.tsx` · `show.tsx` ·
`index.ts` (barrel). Register in `src/App.tsx` with `name` = the database table
name and `list/create/edit/show` routes + `meta`.

**Environment (`.env`):**
```env
TARUVI_SITE_URL=https://<tenant>.taruvibase.cloud
TARUVI_API_KEY=<key>
TARUVI_APP_SLUG=<app-slug>
```
`src/taruviClient.ts` builds the `@taruvi/sdk` `Client` from these; all providers
use it. Run `npm run setup` to generate `.env` + `.mcp.json` interactively.

## Deployment

`npm run deploy` — prompts for the site name, then builds, zips `dist/`, and
uploads to the Taruvi frontend workers API. Requires `TARUVI_API_KEY` and
`TARUVI_APP_SLUG` in `.env`. Inside Docker, `refine build` doesn't work
(symlinked `node_modules`) — `npm run build` already uses
`vite build --configLoader runner`; set `XDG_CONFIG_HOME=/tmp` for refine CLI.
