# Queen Taste & Pub — Menu

Static QR-code menu site for Queen Taste & Pub, Lotus St. cor. Gladiola, Talon Tres, Las Piñas City.

Customers scan a QR code at the table and land on a phone-first page showing the eleven menu pages. Tapping one opens it full size, with pinch-to-zoom, swipe, and keyboard navigation.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The menu page |
| `style.css` | Ivory / burgundy / gold styling taken from the printed posters |
| `script.js` | Renders the category shelves and drives the full-size page viewer |
| `images/` | The eleven menu posters plus the logo |
| `qr-poster.html` | Printable QR-code poster and table tent |
| `deploy.ps1` | Cache-bust, commit, publish to the VPS and push in one command |
| `deploy/` | Docker Compose + nginx config for the VPS |

Menu content lives in the `PAGES` array at the top of `script.js` — filename, title, and the one-line description shown under each card.

## Updating the menu

1. Drop the new poster into `images/`, keeping the existing name to replace a page.
2. If a category was added or removed, edit the `PAGES` array in `script.js`.
3. Run the deploy script.

```powershell
.\deploy.ps1 "Updated drink prices"
```

`deploy.ps1` rewrites the `?v=` version on the CSS and JS links so phones that already visited pick up the new files instead of serving a stale cached copy, then commits and pushes.

## Hosting

Served from the VPS at https://queen-taste-pub.digitalapps.tech/ by a small nginx container behind the shared Caddy (`deploy/`). `deploy.ps1` publishes the committed files there, verifies the live page, then pushes to GitHub as a backup.
