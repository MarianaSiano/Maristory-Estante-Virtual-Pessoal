import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const brandingDir = path.join(process.cwd(), 'public', 'images', 'branding');

const targetDirs = [
    path.join(process.cwd(), 'public', 'images', 'branding'),
    path.join(process.cwd(), 'public', 'branding'),
    path.join(process.cwd(), 'public', 'images'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'assets', 'branding'),
];

// Ensure all target directories exist
targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const tasks = [
    { input: 'logo-light.svg', outputs: ['logo-light.png', 'logo.png'], width: 800 },
    { input: 'logo-dark.svg', outputs: ['logo-dark.png', 'logo-dark-bg.png'], width: 800 },
    { input: 'favicon.svg', outputs: ['favicon.png', 'icon.png'], width: 512 },
    { input: 'logo-icon.svg', outputs: ['logo-icon.png', 'app-icon.png'], width: 512 },
    { input: 'cores-palette.svg', outputs: ['cores-palette.png', 'color-palette.png', 'paleta.png', 'palette.png', 'paleta-de-cores.png'], width: 1600 },
];

console.log('Generating PNG brand images across all public structure directories...');

for (const task of tasks) {
    const svgPath = path.join(brandingDir, task.input);

    if (!fs.existsSync(svgPath)) {
        console.error(`SVG file not found: ${svgPath}`);
        continue;
    }

    const svgContent = fs.readFileSync(svgPath, 'utf-8');
    const resvg = new Resvg(svgContent, {
        fitTo: {
            mode: 'width',
            value: task.width,
        },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    for (const outputName of task.outputs) {
        for (const dir of targetDirs) {
            const targetPath = path.join(dir, outputName);
            fs.writeFileSync(targetPath, pngBuffer);
        }
        console.log(`✅ Created PNG: ${outputName}`);
    }
}

// Copy SVGs and JSON to all directories
const staticFiles = [
    'logo-light.svg',
    'logo-dark.svg',
    'logo-icon.svg',
    'favicon.svg',
    'cores-palette.svg',
    'palette.json'
];

for (const file of staticFiles) {
    const srcPath = path.join(brandingDir, file);
    if (fs.existsSync(srcPath)) {
        for (const dir of targetDirs) {
            const destPath = path.join(dir, file);
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('All PNG & SVG brand assets synced across public directories successfully!');