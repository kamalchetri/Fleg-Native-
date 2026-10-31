// Regression checks for FLEG Native's Android system Back behavior.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const src = fs.readFileSync('App.tsx', 'utf8');
const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));
assert.match(src, /BackHandler\.addEventListener\('hardwareBackPress'/);
assert.doesNotMatch(src, /BackHandler\.exitApp\s*\(/);
assert.doesNotMatch(src, /Press back again to exit/i);
assert.match(src, /if\(route==='home'\)\s*\{[\s\S]*?return true/);
assert.match(src, /if\(menuOpen\)\s*\{setMenuOpen\(false\);return true;\}/);
assert.match(src, /setRoute\(stack\.at\(-1\)\|\|'home'\)/);
assert.equal(config.expo.android.predictiveBackGestureEnabled, false);
console.log('PASS: Android Back is handled without exiting, Home is retained, predictive back is disabled.');
