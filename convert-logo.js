const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'public', 'logo fix.jpg');
const outputPath = path.join(__dirname, 'src', 'lib', 'pdf', 'assets', 'logo.ts');

try {
  const b64 = fs.readFileSync(imagePath).toString('base64');
  const content = `export const LOGO_ASPECT_RATIO = 3.1;\n\nexport const LOGO_BASE64 = "data:image/jpeg;base64,${b64}";\n`;
  
  // Buat folder jika belum ada
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content);
  
  console.log('🚀 Berhasil! File src/lib/pdf/assets/logo.ts telah dibuat.');
} catch (err) {
  console.error('❌ Gagal:', err.message);
}