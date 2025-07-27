#!/usr/bin/env node

// Load polyfill first
import { webcrypto } from 'crypto';
import { execSync } from 'child_process';

// Polyfill crypto.getRandomValues for Node.js v16
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

// Ensure crypto.getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues;
}

console.log('Crypto polyfill loaded successfully');

// Now run the build with the polyfill preloaded
try {
  console.log('Running TypeScript compilation...');
  execSync('tsc -b', { stdio: 'inherit' });

  console.log('Running Vite build...');
  // Use node -r to preload the CommonJS polyfill before running vite
  execSync('node -r ./polyfills.cjs ./node_modules/.bin/vite build', {
    stdio: 'inherit',
  });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
