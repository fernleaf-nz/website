# Fernleaf New Zealand Limited

Complete responsive corporate website, built on the supplied HTML/CSS/JavaScript architecture. No production dependencies, external fonts or runtime image services. Node.js 22+ is recommended for the development tools.

## Run

```sh
npm run dev
```

Open http://127.0.0.1:8000. No installation is needed for the website or build.

```sh
npm run build
npm test
```

The production site is written to `dist/`. Upload that folder to any static web host. To preview the production files locally, stop the development server and run `SERVE_DIST=1 npm run dev`.

## Editing

- `index.html`: semantic page sections and company content.
- `styles.css`: responsive layouts, colours, typography and reduced-motion behaviour.
- `script.js`: navigation, contact configuration and enquiry validation/delivery.
- `config.js`: verified email, phone, offices and optional enquiry endpoint.
- `assets/`: local, replaceable photographs and fern mark; image sources in `assets/README.md`.
- `legal.html`: transparent notices for the current site behaviour.

Preserved all ten business categories and added dedicated honey, water, wine, technology, infrastructure, security, markets, partners, distribution, reasons-to-partner and contact sections. Partner names come from the supplied specification; photography and map routes are illustrative.

## Enquiry delivery

No verified contact details or form service were supplied. Empty configuration values display explicitly as unconfirmed. By default, valid enquiries can be downloaded locally; the interface never claims they were sent. No form content is placed in browser storage.

To enable delivery, set `contact.endpoint` in `config.js` to an HTTPS service you control. It must accept JSON POST requests with `name`, `company`, `email`, `country`, `interest`, and `message`, return 2xx only when accepted, and permit the site's origin via CORS if needed. Configure server-side validation, abuse prevention and appropriate data handling in that service. Never put API secrets in this public file. The interface handles errors and 15-second timeouts without discarding the enquiry.

Before public launch, supply verified contact/office details, confirm the imagery and partner content, and update the privacy notice for the selected host and enquiry service. No certifications, completed projects, approvals, health claims, licences or client names have been added. Canonical URL metadata should be added once the final domain is known.

## Validation

Checked at 1440px desktop, 768px tablet and 375px mobile using Chrome. Confirmed no horizontal overflow, missing images, broken internal anchors or browser console errors. Checked mobile navigation and Escape, required fields, valid enquiry download and legal notice anchors.

`npm test` checks the shipped links/assets, metadata and configurable contact defaults. Browser checks can be run with `npm install --no-save playwright` then `node tests/browser.cjs` while the server is running. They use installed Google Chrome; set `CHROME_PATH` if it is elsewhere. Screenshots go to ignored `work/`.

## GitHub Pages

`.github/workflows/pages.yml` runs the tests and production build on pushes, pull requests and manual runs, then uploads `dist/` as a Pages artifact. Only the repository's default branch can deploy; pull requests and other branches build without publishing. The workflow follows the default branch automatically if it is renamed or changed.

Pages must use **Settings → Pages → Build and deployment → Source: GitHub Actions**. Deployment appears in the `github-pages` environment. Relative asset URLs support both a project site such as `/website/` and a custom domain without rebuilding. No secrets or npm installation are required.
