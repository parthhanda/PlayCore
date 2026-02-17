const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
console.log('Upload Directory:', uploadDir);

if (fs.existsSync(uploadDir)) {
    console.log('Directory exists.');
    const files = fs.readdirSync(uploadDir);
    console.log('Files:', files);
} else {
    console.log('Directory DOES NOT exist.');
}
