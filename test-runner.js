#!/usr/bin/env bun

// Test runner script for Bun.js
const { spawn } = await import('child_process');
const { promisify } = await import('util');

const args = process.argv.slice(2);
const testPath = args[0] || '';

console.log('🧪 Running tests with Bun.js...\n');

// Run different test commands based on arguments
if (args.includes('--ui')) {
  console.log('🎨 Opening Vitest UI...');
  await promisify(spawn)('bun', ['vitest', '--ui'], { stdio: 'inherit' });
} else if (args.includes('--coverage')) {
  console.log('📊 Running tests with coverage...');
  await promisify(spawn)('bun', ['vitest', 'run', '--coverage'], { stdio: 'inherit' });
} else if (args.includes('--watch')) {
  console.log('👀 Running tests in watch mode...');
  await promisify(spawn)('bun', ['vitest', '--watch'], { stdio: 'inherit' });
} else if (testPath) {
  console.log(`🎯 Running tests for: ${testPath}`);
  await promisify(spawn)('bun', ['test', testPath], { stdio: 'inherit' });
} else {
  console.log('⚡ Running all tests...');
  await promisify(spawn)('bun', ['test'], { stdio: 'inherit' });
}
