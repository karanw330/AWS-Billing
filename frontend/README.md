# AWS Billing Dashboard

A standalone React, TypeScript, and Mantine dashboard for the AWS Billing project. It comes with a fixed demo dataset for 20 tenants and the five services in the usage generator. All dates and event timestamps use UTC.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm. From the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173. The demo runs in the browser with no backend, credentials, or environment variables.

## Check the production build

```sh
npm run build
npm run preview
```

The build type-checks the app and outputs static files in `dist/`. Hash-based routes let all five pages work on a static server without rewrite rules.

## Data and filters

- The demo covers August 1 through November 19, 2026, with October selected by default. The header tenant and date filters carry across all pages. The invoice month picker updates the same date filter.
- Charge values are supplied by the mock fixtures as integer USD cents. Overview, service and tenant totals, invoices, and CSV exports use those same event charges. Invoice summaries show the portion of each tenant's billing month covered by the selected dates.
- Pipeline counts and processing times are simulated. Successful-event throughput comes from the demo usage records. Consumer lag reports the last sample in the selected period.
- `src/services/billingData.ts` defines the data source interface, and `src/services/selectors.ts` derives the dashboard views. A future API can supply the data through the provider or move filtering and pagination to the server.

Design inspiration: [Invoice Dashboard Page by Fariz Al](https://dribbble.com/shots/23037508-Invoice-Dashboard-Page).
