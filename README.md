# After Hours - Snake

Minimal retro arcade: a charcoal 24 x 24 grid, vibrant customizable snake, glowing food, saved personal bests, and responsive controls. No runtime dependencies or backend.

## Play locally

Open [index.html](index.html) directly, or run `python3 -m http.server 8000 --bind 127.0.0.1` from this folder and visit http://localhost:8000.

- Arrow keys / WASD: turn.
- Enter: start; Space: pause/resume; R: restart.
- Touch: swipe the arena or use directional buttons.
- Select one of five neon colors or use the custom picker; appearance updates immediately.
- Choose Chill, Classic, or Fast pace.

Scores and color preferences are stored in this browser for this origin. Localhost progress does not transfer to a hosted domain. Google Fonts is optional; local fallbacks work offline. Reduced-motion preferences are supported.

## Deployment

Run `npm run check` and `npm run build`. [build.cjs](build.cjs) publishes only the three browser assets into `dist`. [vercel.json](vercel.json) uses Vercel's static hosting. Local credentials, configuration, and generated artifacts are excluded from Git.

Deployment URLs and verification status will be recorded after publishing.
