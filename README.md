# Manish & Sriviveka — Wedding Reception Invitation

A single-page, animated wedding invitation site: an envelope you tap open, petals falling continuously, a countdown to the big day, event details, an embedded map to the venue, and add-to-calendar / RSVP links.

Live content:
- Sunday, 20th September 2026
- Morning Reception — 10:30 AM onwards
- Lunch (Veg & Non-Veg) — 12:00 PM onwards
- Venue: Srishti Vilasa, Kanakapura Road, Bengaluru

## Structure
```
index.html      Markup / content
css/style.css   Theme, layout, animations
js/script.js    Petal animation, envelope interaction, countdown, calendar links
```

No build step, no dependencies — plain HTML/CSS/JS.

## Run locally
Open `index.html` directly in a browser, or serve it:
```bash
python3 -m http.server 4173
```
then visit `http://localhost:4173`.

## Editing content
- Names, date, time, venue text: edit the relevant sections in `index.html`.
- Countdown / calendar target date-time: `EVENT_DATE`, `startDate`, `endDate` in `js/script.js`.
- Colors/fonts: CSS variables at the top of `css/style.css`.
- Map: the venue name is embedded via a Google Maps search query in `index.html` (`.map-frame iframe` src) — update the query string if the venue changes.

## Publish for free on GitHub Pages

1. Create a new **public** repository on GitHub (e.g. `manish-sriviveka-wedding`).
2. From this folder:
   ```bash
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub: go to the repo → **Settings → Pages** → under "Build and deployment", set **Source** to `Deploy from a branch`, branch `main`, folder `/ (root)` → **Save**.
4. After a minute, your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

Share that link with your guests.
