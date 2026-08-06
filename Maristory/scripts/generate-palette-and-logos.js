import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const publicImagesDir = path.join(process.cwd(), 'public', 'images');
const logosComFundoDir = path.join(publicImagesDir, 'logos', 'Com Fundo');
const logosFundoTransparenteDir = path.join(publicImagesDir, 'logos', 'Fundo Transparente');

// Ensure directories exist
[publicImagesDir, logosComFundoDir, logosFundoTransparenteDir].forEach(dir => {
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Color swatch definitions matching Maristory palette
const colorSwatches = [
    { name: 'Very Dark Violet.png', hex: '#220042', label: 'Very Dark Violet', role: 'Fundo Principal' },
    { name: 'Russian Violet.png', hex: '#2E005B', label: 'Russian Violet', role: 'Midnight Purple' },
    { name: 'Persian Indigo.png', hex: '#3D0075', label: 'Persian Indigo', role: 'Royal Purple' },
    { name: 'Purple X11.png', hex: '#6317A8', label: 'Purple X11', role: 'Vibrant Purple' },
    { name: 'Violeta.png', hex: '#7B1FA2', label: 'Violeta', role: 'Primary Purple' },
    { name: 'Medium Purple.png', hex: '#8E24AA', label: 'Medium Purple', role: 'Rich Violet' },
    { name: 'Bright Lilac.png', hex: '#BA68C8', label: 'Bright Lilac', role: 'Lavender Accent' },
    { name: 'Mauve.png', hex: '#E1BEE7', label: 'Mauve', role: 'Soft Lavender' },
];

function generateColorSwatchSvg(hex, label, role) {
    const isDark = ['#220042', '#2E005B', '#3D0075', '#6317A8', '#7B1FA2'].includes(hex);
    const textColor = isDark ? '#FFFFFF' : '#220042';
    const subColor = isDark ? '#E1BEE7' : '#3D0075';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
        <rect width="512" height="512" fill="${hex}" rx="48"/>
        <rect x="24" y="24" width="464" height="464" fill="none" stroke="${subColor}" stroke-width="4" rx="36" opacity="0.4"/>
        <text x="256" y="230" font-family="sans-serif" font-size="32" font-weight="bold" fill="${textColor}" text-anchor="middle">${label}</text>
        <text x="256" y="280" font-family="sans-serif" font-size="24" font-weight="600" fill="${subColor}" text-anchor="middle">${hex}</text>
        <text x="256" y="320" font-family="sans-serif" font-size="18" fill="${subColor}" text-anchor="middle" opacity="0.8">${role}</text>
    </svg>`;
}

// Generate Color Swatch PNGs
console.log('Generating color palette PNGs...');
for(const swatch of colorSwatches) {
    const svg = generateColorSwatchSvg(swatch.hex, swatch.label, swatch.role);
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 512 } });
    const pngBuffer = resvg.render().asPng();
    const filePath = path.join(publicImagesDir, swatch.name);
    fs.writeFileSync(filePath, pngBuffer);
    console.log(`✅ Swatch created: ${swatch.name}`);
}

// Generate Logos (Com Fundo and Fundo Transparente)
const logoWithBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300">
    <defs>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&amp;family=Plus+Jakarta+Sans:wght@600&amp;display=swap');
        .title { font-family: 'Great Vibes', cursive; font-size: 110px; fill: #ffffff; }
        .sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; fill: #e1bee7; letter-spacing: 4px; text-transform: uppercase; }
        </style>
    </defs>
    <rect width="800" height="300" fill="#220042" rx="32"/>
    <rect x="16" y="16" width="768" height="268" fill="none" stroke="#3d0075" stroke-width="3" rx="24"/>
    <g transform="translate(80, 160)">
        <path d="M 0 30 C 25 15, 45 22, 50 25 C 55 22, 75 15, 100 30 L 100 45 C 75 30, 55 37, 50 40 C 45 37, 25 30, 0 45 Z" fill="none" stroke="#e1bee7" stroke-width="3" stroke-linecap="round"/>
        <path d="M 50 25 L 50 40" stroke="#e1bee7" stroke-width="3"/>
        <path d="M 50 25 Q 50 -10 50 -35" stroke="#e1bee7" stroke-width="3" fill="none"/>
        <path d="M 50 -10 Q 35 -25 20 -40" stroke="#e1bee7" stroke-width="2" fill="none"/>
        <path d="M 50 -10 Q 65 -25 80 -40" stroke="#e1bee7" stroke-width="2" fill="none"/>
        <path d="M 42 -35 C 42 -48, 46 -52, 50 -52 C 54 -52, 58 -48, 58 -35 Z" fill="#ba68c8"/>
        <path d="M 12 -40 C 8 -50, 15 -55, 20 -52 C 24 -50, 22 -43, 18 -38 Z" fill="#e1bee7"/>
        <path d="M 88 -40 C 92 -50, 85 -55, 80 -52 C 76 -50, 78 -43, 82 -38 Z" fill="#e1bee7"/>
    </g>
    <text class="title" x="220" y="170">Maristory</text>
    <text class="sub" x="225" y="215">ESTANTE VIRTUAL PESSOAL</text>
</svg>`;

const logoTransparentSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" width="800" height="300">
    <defs>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&amp;family=Plus+Jakarta+Sans:wght@600&amp;display=swap');
        .title { font-family: 'Great Vibes', cursive; font-size: 110px; fill: #6b21a8; }
        .sub { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; fill: #7b1fa2; letter-spacing: 4px; text-transform: uppercase; }
        </style>
    </defs>
    <g transform="translate(80, 160)">
        <path d="M 0 30 C 25 15, 45 22, 50 25 C 55 22, 75 15, 100 30 L 100 45 C 75 30, 55 37, 50 40 C 45 37, 25 30, 0 45 Z" fill="none" stroke="#7b1fa2" stroke-width="3" stroke-linecap="round"/>
        <path d="M 50 25 L 50 40" stroke="#7b1fa2" stroke-width="3"/>
        <path d="M 50 25 Q 50 -10 50 -35" stroke="#7b1fa2" stroke-width="3" fill="none"/>
        <path d="M 50 -10 Q 35 -25 20 -40" stroke="#7b1fa2" stroke-width="2" fill="none"/>
        <path d="M 50 -10 Q 65 -25 80 -40" stroke="#7b1fa2" stroke-width="2" fill="none"/>
        <path d="M 42 -35 C 42 -48, 46 -52, 50 -52 C 54 -52, 58 -48, 58 -35 Z" fill="#8e24aa"/>
        <path d="M 12 -40 C 8 -50, 15 -55, 20 -52 C 24 -50, 22 -43, 18 -38 Z" fill="#ba68c8"/>
        <path d="M 88 -40 C 92 -50, 85 -55, 80 -52 C 76 -50, 78 -43, 82 -38 Z" fill="#ba68c8"/>
    </g>
    <text class="title" x="220" y="170">Maristory</text>
    <text class="sub" x="225" y="215">ESTANTE VIRTUAL PESSOAL</text>
</svg>`;

console.log('Generating Logos for "Com Fundo" and "Fundo Transparente"...');

const renderPng = (svg, width = 800) => {
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
    return resvg.render().asPng();
};

const bgPng = renderPng(logoWithBgSvg);
const transPng = renderPng(logoTransparentSvg);

// Write to Com Fundo
fs.writeFileSync(path.join(logosComFundoDir, 'Maristory - Com Fundo.png'), bgPng);
fs.writeFileSync(path.join(logosComFundoDir, 'Maristory.png'), bgPng);

// Write to Fundo Transparente
fs.writeFileSync(path.join(logosFundoTransparenteDir, 'Maristory - Fundo Transparente.png'), transPng);
fs.writeFileSync(path.join(logosFundoTransparenteDir, 'Maristory -- Fundo Transparente.png'), transPng);

console.log('✅ Logo images created in logos/Com Fundo and logos/Fundo Transparente');