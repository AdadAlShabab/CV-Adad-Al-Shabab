Simple Resume Viewer with Analytics

This repository contains a small static website that displays a resume (PDF) and records simple analytics (views, downloads) to a Google Sheet via a Google Apps Script web app. The analytics endpoint is protected by a secret token so only you can view the dashboard.

Files added:
- index.html — public resume viewer (zoom, scroll, download)
- admin.html — private analytics card with totals and daily view chart
- scripts/main.js — client-side tracking and viewer controls
- scripts/admin.js — fetches analytics for admin card
- apps_script/analytics.gs — Google Apps Script server to store and expose analytics (paste into Apps Script)

Quick steps:
1. Keep your resume PDF in the repo root. The current viewer uses `Adad Al Shabab’s Resume.pdf`.
2. Deploy apps_script/analytics.gs as a Web App (Anyone, even anonymous) and note the URL.
3. Create a script property named `ANALYTICS_ADMIN_TOKEN` with a secret value. Never put this token in JavaScript or GitHub.
4. Set the deployed `/exec` URL in `scripts/main.js` and `scripts/admin.js`.
5. Publish this repo using GitHub Pages.
6. Open `admin.html` directly. Enter the token in the password field; it is kept only in that browser session.

Security notes:
- The Apps Script URL is public routing information, not a secret key. Public visitors need it to send analytics events.
- The admin token stays in Apps Script Script Properties and is never committed to this repository.
- GitHub Pages does not load `.env` files. `.env.example` documents configuration, while `.env` is ignored by Git.
- The public viewer contains no admin link. Anyone can technically guess `admin.html`, but they cannot load analytics without the token.

See the comments inside the files for detailed setup instructions.
