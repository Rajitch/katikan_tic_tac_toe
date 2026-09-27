# Tic-Tac-Toe — Free Static Web Game

A dependency-free Tic-Tac-Toe game designed for free long-term hosting on Cloudflare Pages.

## Features

- Player vs Computer
- 2-player local mode
- Easy / Medium / Impossible difficulty
- Score persistence with browser LocalStorage
- Dark/light theme
- Responsive mobile layout
- Accessible buttons and live status
- No backend
- No database
- No API keys
- No npm dependencies
- No build step

## Files

- `index.html` — page structure
- `style.css` — responsive UI
- `script.js` — game engine, AI and LocalStorage
- `favicon.svg` — icon
- `site.webmanifest` — optional install metadata
- `robots.txt` — crawler rules
- `404.html` — fallback page

## Local test

Open `index.html` directly in a modern browser, or run a local static server:

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

## Cloudflare Pages

Recommended deployment:

- Git provider: GitHub
- Production branch: `main`
- Build command: `exit 0`
- Build output directory: `.`
- No environment variables required

After deployment Cloudflare provides a `*.pages.dev` address.

## Updating the game

Edit files, then:

```bash
git add .
git commit -m "Update game"
git push
```

Cloudflare Pages automatically deploys the new `main` commit.

## Cost

The game is designed to use only static assets. Cloudflare Pages documents static asset requests as free and unlimited on its current plans. No paid domain is required to use the generated `pages.dev` address.

## Important

Do not add server-side code, paid APIs, analytics scripts, or external assets unless you actually need them. Keeping the project static preserves the simplest and most predictable free-hosting model.
