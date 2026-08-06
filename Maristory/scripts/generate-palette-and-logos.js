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