# SE Website

A multi-page Next.js documentation website for the SE programming language.

## Included

- Light-purple, documentation-first design inspired by the clarity of Python.org and modern product sites.
- English-first UI with a persistent Traditional Chinese toggle.
- Full core syntax curriculum split into 24 lesson pages.
- All 59 currently importable built-in module names, including 7 aliases.
- A dedicated module page with API signatures and a quick-start example for every module.
- SE Web 0.8 and Browser API guide.
- Browser-only SE core playground simulator.
- Installation and CLI workflow pages.
- Responsive layout suitable for desktop and mobile.
- Vercel-ready Next.js App Router project.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Framework Preset: Next.js.
4. Build command: `npm run build`.
5. No environment variables are required for the documentation site.

## Playground scope

The `/playground` page is a browser simulator for core learning syntax. It does not execute the native C++ SE runtime inside Vercel. Native/platform APIs such as filesystem access, processes, sockets, SQLite, Node.js, and Next.js should be tested with the actual SE CLI.

## Source alignment

The content is based on the current `funlearnstudio/SE` main documentation and the VS Code `language-data.js` module list. Core release content is labeled SE 0.7.0; SE Web / Browser API content is labeled separately as 0.8 documentation.
