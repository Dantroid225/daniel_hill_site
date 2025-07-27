#!/usr/bin/env node

// Simple build script with get-random-values polyfill
import 'get-random-values';
import { execSync } from 'child_process';

console.log('get-random-values polyfill loaded');

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
