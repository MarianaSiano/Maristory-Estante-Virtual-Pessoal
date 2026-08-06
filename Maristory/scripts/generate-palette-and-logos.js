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