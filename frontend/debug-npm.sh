#!/bin/bash

echo "=== npm Debug Script ==="
echo "Current directory: $(pwd)"
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

echo ""
echo "=== Testing npm registry connectivity ==="
npm ping

echo ""
echo "=== Testing DNS resolution ==="
nslookup registry.npmjs.org

echo ""
echo "=== Checking package.json ==="
cat package.json

echo ""
echo "=== Testing npm install with verbose output ==="
npm cache clean --force
npm config set registry https://registry.npmjs.org/
npm install --verbose --no-audit --no-fund

echo ""
echo "=== npm install completed ===" 