# SE Website

A multi-page Next.js documentation website for the SE programming language.

## Included

- Light-purple, documentation-first design inspired by the clarity of Python.org and modern product sites.
- English-first UI with a persistent Traditional Chinese toggle.
- Full core syntax curriculum with 29 bilingual lessons aligned with SE 0.8.0.
- All 117 currently importable built-in modules, documented as standalone packages.
- A dedicated module page with API signatures and a quick-start example for every module, including collections helpers, numeric and data tools, network services, and focused game modules.
- SE Web 0.8 and Browser API guide.
- Browser-only SE core playground simulator.
- Browser simulator supports SE 0.8.0 typed `read` standard input (via a separate stdin field), typed/multidimensional zero-initialized Lists, and legacy multi-variable `ask`. The simulator is not the full SE runtime.
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

The built-in module list and API catalog track the `funlearnstudio/SE` repository and its VS Code `language-data.js` definitions. The site documents 117 importable module packages. Core release content is synchronized with **SE 0.8.0**; **SE Web 0.8** is the separate Web language and Browser API documentation version. The browser Playground remains a learning simulator rather than an implementation of the complete production compiler.
