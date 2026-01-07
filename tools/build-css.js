#!/usr/bin/env node
const { execSync } = require('child_process');
const { readdirSync } = require('fs');
const { join } = require('path');

// Minify CSS files
const stylesDir = join(__dirname, '../styles');
const cssFiles = readdirSync(stylesDir)
  .filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));

cssFiles.forEach(file => {
  const input = join(stylesDir, file);
  const output = join(stylesDir, file.replace('.css', '.min.css'));
  console.log(`Minifying ${file}...`);
  execSync(`cleancss -o "${output}" "${input}"`, { stdio: 'inherit' });
});

console.log(`✓ Minified ${cssFiles.length} CSS files`);
