// Polyfill for Node.js v16 compatibility (CommonJS version)
// This file should be imported before any other modules that use crypto

// Import the specific polyfill for crypto.getRandomValues
require('get-random-values');

// Also set up webcrypto as backup
const { webcrypto } = require('crypto');

// Polyfill crypto.getRandomValues for Node.js v16
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

// Ensure crypto.getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues;
}

console.log(
  'Crypto polyfill loaded successfully (CommonJS with get-random-values)'
);
