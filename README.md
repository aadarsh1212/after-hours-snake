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

- **Play:** https://after-hours-snake-xi.vercel.app/
- **Private source repository:** https://github.com/aadarsh1212/after-hours-snake
- **Vercel project:** https://vercel.com/orion-d52a/after-hours-snake

Deployed on 2026-10-30 using the authenticated Vercel CLI in the existing Orion team. Public production access is verified without sign-in. Preview deployments retain Vercel Authentication.

Automatic GitHub deployment is **not connected**: Vercel's project-link API reports that the private repository cannot be found/accessed. Grant the Vercel GitHub App access to this repository, then run `vercel git connect https://github.com/aadarsh1212/after-hours-snake --yes --scope orion-d52a`. Until connected, publish with `vercel deploy --prod --yes --scope orion-d52a` from this folder.

## Verification

Syntax checks and the static build passed. [Deployment smoke checks](tests/deployment-smoke.cjs) passed against the public URL in headless Chrome: anonymous HTTP 200, browser assets, preset/custom color updates and persistence, start, movement, turning, pause/resume, wall collision, restart, mobile direction controls, and no page overflow at 320/390/768/1440/1920 pixels. No JavaScript exceptions were observed. A narrow-phone layout issue discovered during testing was corrected and redeployed.

To rerun, install Playwright in a test-only location, then run `node tests/deployment-smoke.cjs` with `PLAYWRIGHT_PATH` and `CHROME_PATH` set as needed. `GAME_URL` overrides the test target. Results and screenshots are generated under the Git-ignored `artifacts/ui` directory; tests and screenshots are never served by the static build.
