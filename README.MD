# Taruvi Refine Template (Ant Design)

A [Refine](https://refine.dev) v5 + [Ant Design](https://ant.design) starter wired to the [Taruvi](https://taruvi.ai) backend (data, auth, storage, app, user providers).

## Getting started

```bash
npm install          # also fetches the Taruvi agent skills (postinstall)
npm run setup        # interactive: writes .env (and MCP config) from .env.example
npm run dev
```

`.env` needs `TARUVI_SITE_URL`, `TARUVI_APP_SLUG` and `TARUVI_API_KEY` (see `.env.example`). The app throws at startup if one is missing.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server (browser errors are logged to `logs/frontend.ndjson`) |
| `npm run build` | Type-check and build for production |
| `npm run setup` | Generate `.env` from `.env.example` |
| `npm run deploy` | Build, zip `dist/`, and upload to the Taruvi frontend workers API |

## Project layout

```
src/
  App.tsx                 Refine setup, routes, resources
  providers/              Taruvi providers (data, auth, storage, app, user, access control)
  components/             CustomSider, ErrorBoundary, UnsavedChangesDialog, ListPageShell, ConsoleLogDrawer
  contexts/               color-mode (antd ConfigProvider theme), app-settings
  theme/themeOptions.ts   Design tokens — brand the app here
  pages/examples/         Copy-from CRUD examples (list/create/edit, Zod forms, access control)
  pages/{home,login,...}  App pages
  utils/                  storage/function helpers, client error logger
```

## For AI agents

`AGENTS.md` (all agents) and `CLAUDE.md` (Claude Code subagent flow) define the working rules: functional-app default, plan in `docs/spec.md`, Taruvi skill preflight, Zod forms, antd usage. References: `docs/antd-reference.md`, `docs/zod-reference.md`.

## Learn more

- [Refine docs](https://refine.dev/docs) · [Refine + antd](https://refine.dev/docs/ui-frameworks/antd/tutorial/)
- [Ant Design](https://ant.design/components/overview)

## License

MIT
