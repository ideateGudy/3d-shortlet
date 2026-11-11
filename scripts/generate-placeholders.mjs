import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUTPUT_DIRS = [
  path.resolve('apps/api/uploads/placeholders'),
  path.resolve('apps/web/public/placeholders'),
];

for (const dir of OUTPUT_DIRS) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const PALETTES = {
  obsidian: { bg1: '#111318', bg2: '#242a38', accent: '#dfb76c', text: '#f3f4f6' },
  azure: { bg1: '#0b1d28', bg2: '#163b52', accent: '#38bdf8', text: '#f0f9ff' },
  komorebi: { bg1: '#141c14', bg2: '#283625', accent: '#86efac', text: '#f0fdf4' },
  solis: { bg1: '#26140e', bg2: '#4a281b', accent: '#fb923c', text: '#fff7ed' },
};

const SECTIONS = [
  { key: 'arrival', name: 'Exterior Arrival', type: 'PANORAMA' },
  { key: 'living', name: 'Living Room', type: 'PANORAMA' },
  { key: 'bedroom', name: 'Master Bedroom', type: 'PANORAMA' },
  { key: 'kitchen', name: 'Chef’s Kitchen', type: 'PHOTO' },
  { key: 'bathroom', name: 'Spa Bathroom', type: 'PHOTO' },
  { key: 'terrace', name: 'Skyline Terrace', type: 'PANORAMA' },
];

const PROPERTIES = [
  { slug: 'obsidian-penthouse', title: 'The Obsidian Penthouse', palette: PALETTES.obsidian },
  { slug: 'azure-cliffside-villa', title: 'Azure Cliffside Villa', palette: PALETTES.azure },
  { slug: 'komorebi-forest-sanctuary', title: 'Komorebi Forest Sanctuary', palette: PALETTES.komorebi },
  { slug: 'solis-desert-pavilion', title: 'Solis Desert Pavilion', palette: PALETTES.solis },
];

function createEquirectangularSvg(width, height, propTitle, secName, palette) {
  // Grid lines: horizon, latitude arcs, longitude lines
  const horizon = height / 2;
  let lines = `<line x1="0" y1="${horizon}" x2="${width}" y2="${horizon}" stroke="${palette.accent}" stroke-width="2" stroke-dasharray="8,8" opacity="0.4"/>`;
  
  for (let deg = 30; deg < 360; deg += 30) {
    const x = (deg / 360) * width;
    lines += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${palette.accent}" stroke-width="1" stroke-dasharray="4,8" opacity="0.2"/>`;
    lines += `<text x="${x}" y="${horizon - 15}" fill="${palette.accent}" font-size="20" font-family="sans-serif" opacity="0.4" text-anchor="middle">${deg}°</text>`;
  }

  // Compass directions
  const nX = width / 2;
  const eX = (width * 3) / 4;
  const sX = width;
  const wX = width / 4;

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="50%" stop-color="${palette.bg2}" />
        <stop offset="100%" stop-color="${palette.bg1}" />
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="45%" r="40%">
        <stop offset="0%" stop-color="${palette.accent}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${palette.bg1}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#sunGlow)" />
    
    ${lines}
    
    <!-- Horizon Compass markers -->
    <text x="${wX}" y="${horizon + 40}" fill="${palette.accent}" font-size="32" font-weight="bold" font-family="sans-serif" text-anchor="middle">W</text>
    <text x="${nX}" y="${horizon + 40}" fill="${palette.accent}" font-size="32" font-weight="bold" font-family="sans-serif" text-anchor="middle">N</text>
    <text x="${eX}" y="${horizon + 40}" fill="${palette.accent}" font-size="32" font-weight="bold" font-family="sans-serif" text-anchor="middle">E</text>

    <!-- Center Room Badge -->
    <g transform="translate(${width / 2}, ${horizon - 120})">
      <rect x="-350" y="-70" width="700" height="140" rx="24" fill="rgba(6, 8, 13, 0.75)" stroke="${palette.accent}" stroke-width="2" />
      <text x="0" y="-15" fill="${palette.accent}" font-size="24" font-weight="600" font-family="sans-serif" letter-spacing="4" text-anchor="middle">${propTitle.toUpperCase()}</text>
      <text x="0" y="35" fill="${palette.text}" font-size="44" font-weight="bold" font-family="sans-serif" text-anchor="middle">360° ${secName}</text>
    </g>
  </svg>
  `;
}

function createPhotoSvg(width, height, propTitle, secName, palette) {
  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="photoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.bg1}" />
        <stop offset="60%" stop-color="${palette.bg2}" />
        <stop offset="100%" stop-color="${palette.bg1}" />
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="65%">
        <stop offset="40%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.85)" />
      </radialGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#photoGrad)" />
    
    <!-- Architectural grid lines for depth effect -->
    <line x1="0" y1="0" x2="${width * 0.3}" y2="${height * 0.4}" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>
    <line x1="${width}" y1="0" x2="${width * 0.7}" y2="${height * 0.4}" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>
    <line x1="0" y1="${height}" x2="${width * 0.3}" y2="${height * 0.7}" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>
    <line x1="${width}" y1="${height}" x2="${width * 0.7}" y2="${height * 0.7}" stroke="${palette.accent}" stroke-width="2" opacity="0.3"/>
    <rect x="${width * 0.3}" y="${height * 0.4}" width="${width * 0.4}" height="${height * 0.3}" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.3"/>

    <rect width="${width}" height="${height}" fill="url(#vignette)" />

    <!-- Center Card -->
    <g transform="translate(${width / 2}, ${height / 2})">
      <rect x="-300" y="-80" width="600" height="160" rx="20" fill="rgba(6, 8, 13, 0.75)" stroke="${palette.accent}" stroke-width="2" />
      <text x="0" y="-20" fill="${palette.accent}" font-size="20" font-weight="600" font-family="sans-serif" letter-spacing="3" text-anchor="middle">${propTitle.toUpperCase()}</text>
      <text x="0" y="30" fill="${palette.text}" font-size="38" font-weight="bold" font-family="sans-serif" text-anchor="middle">${secName}</text>
    </g>
  </svg>
  `;
}

async function run() {
  console.log('Generating procedural 360° panoramas and luxury property photos...');

  for (const prop of PROPERTIES) {
    for (const sec of SECTIONS) {
      const isPano = sec.type === 'PANORAMA';
      const width = isPano ? 2048 : 1920;
      const height = isPano ? 1024 : 1280;
      const filename = `${prop.slug}-${sec.key}.jpg`;

      const svg = isPano
        ? createEquirectangularSvg(width, height, prop.title, sec.name, prop.palette)
        : createPhotoSvg(width, height, prop.title, sec.name, prop.palette);

      const buffer = await sharp(Buffer.from(svg))
        .jpeg({ quality: 85 })
        .toBuffer();

      for (const outDir of OUTPUT_DIRS) {
        fs.writeFileSync(path.join(outDir, filename), buffer);
      }
      console.log(`  ✓ Generated ${filename} (${width}x${height})`);
    }
  }

  console.log('All placeholder media successfully generated!');
}

run().catch((err) => {
  console.error('Error generating placeholders:', err);
  process.exit(1);
});
