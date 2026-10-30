'use strict';
// Publish only browser assets, never deployment notes, tests, or local credentials.
const fs = require('node:fs');
const path = require('node:path');
const output = path.join(__dirname, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of ['index.html', 'style.css', 'game.js']) {
  fs.copyFileSync(path.join(__dirname, file), path.join(output, file));
}
console.log('Built After Hours - Snake into dist');
