# CICA Life Agent Dashboard — Demo

A standalone Angular 19 + Ionic 8 dashboard prototype. It runs entirely in the browser with fictional sample records and metrics; there are no API calls, secrets, or backend requirements.

## Run locally

```sh
npm install
npm start
```

Open the URL printed by Angular CLI. Create a production bundle with `npm run build`; the static site is emitted to `dist/cica-life-dashboard/browser`.

## Deploy to Vercel

Use `ionic-demo` as the Vercel project root. `vercel.json` sets the build command, static output directory, and SPA fallback. You can also deploy this folder with the Vercel CLI after extracting the ZIP.

## Demo behavior

Month, quarter, YTD, and custom date controls update the visible period state. Search, sort, pagination, row detail expansion, activity panel, refresh feedback, and CSV export work locally. The project is self-contained so its Ionic components and mock-data service can later be transferred into a larger Angular workspace.
