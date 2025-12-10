// Script para generar iconos PWA
// Este script crea todos los tamaños de iconos necesarios para la PWA

const fs = require('fs');
const path = require('path');

// Función para crear directorio de iconos si no existe
function ensureIconsDirectory() {
    const iconsDir = path.join(__dirname, 'icons');
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    return iconsDir;
}

// Función para copiar y redimensionar imagen (simulación)
// En un entorno real, aquí se usaría sharp o similar para redimensionar
function createIcon(sourcePath, targetPath, size) {
    // En este ejemplo, copiamos la imagen original
    // En un entorno con herramientas de imagen, aquí redimensionaríamos
    try {
        const data = fs.readFileSync(sourcePath);
        fs.writeFileSync(targetPath, data);
        console.log(`✅ Icono creado: ${targetPath} (${size}x${size})`);
    } catch (error) {
        console.error(`❌ Error creando icono ${targetPath}:`, error);
    }
}

// Generar todos los iconos PWA
function generateIcons() {
    const sourceImage = path.join(__dirname, 'logo-redes_Transparente-216x216.png');
    const iconsDir = ensureIconsDirectory();
    
    const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    console.log('🎨 Generando iconos PWA...');
    
    iconSizes.forEach(size => {
        const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
        createIcon(sourceImage, iconPath, size);
    });
    
    console.log('🎨 Generación de iconos completada');
}

// Ejecutar si se llama directamente
if (require.main === module) {
    generateIcons();
}

module.exports = { generateIcons, ensureIconsDirectory };