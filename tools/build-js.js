#!/usr/bin/env node
const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');

function minifyJsInDir(dir) {
  const files = readdirSync(dir);
  let count = 0;
  
  files.forEach(file => {
    const fullPath = join(dir, file);
    
    if (file.endsWith('.js') && !file.endsWith('.min.js') && 
        !file.includes('.backup') && !file.includes('.original')) {
      const output = fullPath.replace('.js', '.min.js');
      console.log(`Minifying ${file}...`);
      execSync(`terser "${fullPath}" -o "${output}" -c -m`, { stdio: 'inherit' });
      count++;
    }
  });
  
  return count;
}

// Minify JS files in scripts/ and lib/
const scriptsCount = minifyJsInDir(join(__dirname, '../scripts'));
const libCount = minifyJsInDir(join(__dirname, '../lib'));

console.log(`✓ Minified ${scriptsCount + libCount} JS files`);
