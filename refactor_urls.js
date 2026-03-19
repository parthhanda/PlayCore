const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
let changedFiles = 0;

files.forEach(file => {
  if (file.includes('avatarUtils.js')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace single quoted 'http://localhost:5000...' with backticks
  content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
  
  // Replace double quoted "http://localhost:5000..." with backticks
  content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");

  // Replace inside existing backticks: `http://localhost:5000...`
  content = content.replace(/`http:\/\/localhost:5000/g, "`\\${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
    console.log('Updated', file);
  }
});

console.log('Done! Total files updated:', changedFiles);
