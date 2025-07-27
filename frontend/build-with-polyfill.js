#!/usr/bin/env node

// Load polyfill first
const { webcrypto } = require('crypto');

// Polyfill crypto.getRandomValues for Node.js v16
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

// Ensure crypto.getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues;
}

console.log('Crypto polyfill loaded successfully');

// Now run the build
const { execSync } = require('child_process');

try {
  console.log('Running TypeScript compilation...');
  execSync('tsc -b', { stdio: 'inherit' });

  console.log('Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
