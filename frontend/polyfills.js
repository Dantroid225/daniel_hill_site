// Polyfill for Node.js v16 compatibility
// This file should be imported before any other modules that use crypto

import { webcrypto } from 'crypto';

// Polyfill crypto.getRandomValues for Node.js v16
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

// Ensure crypto.getRandomValues is available
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = webcrypto.getRandomValues;
}

console.log('Crypto polyfill loaded successfully');
