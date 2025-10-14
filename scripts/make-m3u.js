const fs = require('fs');
const path = require('path');
const domain = process.env.DOMAIN || '';
const audioDir = path.join(__dirname, '..', 'audio');
const out = path.join(__dirname, '..', 'SmartDocsRadio.m3u');

const files = fs.readdirSync(audioDir)
  .filter(f => /\.(mp3|aac)$/i.test(f))
  .sort((a,b)=> a.localeCompare(b));

let m3u = '#EXTM3U\n';
for (const f of files) {
  const title = path.basename(f, path.extname(f));
  m3u += `#EXTINF:-1,${title}\n`;
  m3u += (domain ? `${domain}/audio/${f}` : `audio/${f}`) + '\n';
}

fs.writeFileSync(out, m3u, 'utf8');
console.log('Generated', out);
