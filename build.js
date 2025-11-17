const fs = require('fs');
const path = require('path');
const { minify: terserMinify } = require('terser');
const CleanCSS = require('clean-css');

let sharp = null;
try {
    sharp = require('sharp');
} catch (error) {
    console.warn('Aviso: no se pudo cargar sharp. Se omitirán las variantes de imagen responsivas.', error?.message || '');
}

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const STATIC_FILES = [
    'index.html',
    'analytics.js',
    'menu-data.json',
    'hero-carousel.json',
    'firebase-init.js'
];

const MINIFY_FILES = {
    js: ['script.js', 'translations.js'],
    css: ['styles.css']
};

const DIRECTORIES = [
    { src: path.join(ROOT_DIR, 'assets'), dest: path.join(PUBLIC_DIR, 'assets') },
    { src: path.join(ROOT_DIR, 'images'), dest: path.join(PUBLIC_DIR, 'images') }
];

const RESPONSIVE_IMAGE_WIDTHS = [480, 768, 1200];
const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const WEBP_OPTIONS = { quality: 80, effort: 4, alphaQuality: 80 }; 
const JPEG_OPTIONS = { quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' };
const PNG_OPTIONS = { compressionLevel: 9, adaptiveFiltering: true, palette: true };

const responsiveManifest = {};

function normalizeRelativePath(filePath) {
    return filePath.split(path.sep).join('/');
}

function writeResponsiveManifest(manifest) {
    const json = JSON.stringify(manifest, null, 2);
    const publicPath = path.join(PUBLIC_DIR, 'responsive-images.json');
    ensureDir(path.dirname(publicPath));
    fs.writeFileSync(publicPath, json);
    try {
        fs.writeFileSync(path.join(ROOT_DIR, 'responsive-images.json'), json);
    } catch (error) {
        console.warn('No se pudo escribir responsive-images.json en la raíz del proyecto:', error.message);
    }
}

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(file) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(PUBLIC_DIR, file);

    if (!fs.existsSync(src)) {
        console.warn(`Aviso: el archivo ${file} no existe y no se copiará.`);
        return;
    }

    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest) {
    if (!fs.existsSync(src)) {
        return;
    }

    ensureDir(dest);

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function collectImageFiles(dir) {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectImageFiles(fullPath));
        } else {
            const ext = path.extname(entry.name).toLowerCase();
            if (SUPPORTED_IMAGE_EXTENSIONS.has(ext)) {
                files.push(fullPath);
            }
        }
    }

    return files;
}

async function buildVariantsForImage(srcPath) {
    if (!sharp) return 0;

    const ext = path.extname(srcPath).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(ext)) return 0;

    const relativePath = path.relative(ROOT_DIR, srcPath);
    const normalizedOriginalPath = normalizeRelativePath(relativePath);
    const relativeDir = path.dirname(relativePath);
    const parsed = path.parse(srcPath);
    const destDir = path.join(PUBLIC_DIR, relativeDir);
    ensureDir(destDir);

    let metadata;
    try {
        metadata = await sharp(srcPath).metadata();
    } catch (error) {
        console.warn(`No se pudo leer metadata de ${relativePath}: ${error.message}`);
        return 0;
    }

    const fallbackFormat = ext === '.png' ? 'png' : 'jpeg';
    const fallbackOptions = fallbackFormat === 'png' ? PNG_OPTIONS : JPEG_OPTIONS;

    const availableWidths = RESPONSIVE_IMAGE_WIDTHS.filter(width => !metadata.width || metadata.width >= width);
    if (metadata.width && metadata.width > 0) {
        const rounded = Math.round(metadata.width);
        if (!availableWidths.includes(rounded)) {
            availableWidths.push(rounded);
        }
    }

    const uniqueWidths = [...new Set(availableWidths)].sort((a, b) => a - b);
    let variantCount = 0;

    responsiveManifest[normalizedOriginalPath] = {
        widths: uniqueWidths,
        fallback: fallbackFormat,
        hasWebp: true
    };

    for (const width of uniqueWidths) {
        const resizeOptions = {
            width,
            withoutEnlargement: true,
            fit: 'inside'
        };

        const baseName = `${parsed.name}-${width}w`;
        const fallbackOutput = path.join(destDir, `${baseName}${ext}`);
        try {
            await sharp(srcPath)
                .resize(resizeOptions)
                .toFormat(fallbackFormat, fallbackOptions)
                .toFile(fallbackOutput);
            variantCount += 1;
        } catch (error) {
            console.warn(`No se pudo generar ${path.relative(PUBLIC_DIR, fallbackOutput)}: ${error.message}`);
        }

        const webpOutput = path.join(destDir, `${baseName}.webp`);
        try {
            await sharp(srcPath)
                .resize(resizeOptions)
                .webp(WEBP_OPTIONS)
                .toFile(webpOutput);
            variantCount += 1;
        } catch (error) {
            console.warn(`No se pudo generar ${path.relative(PUBLIC_DIR, webpOutput)}: ${error.message}`);
        }
    }

    return variantCount;
}

async function generateResponsiveImages() {
    if (!sharp) {
        return { processedCount: 0, variantCount: 0 };
    }

    let processedCount = 0;
    let variantCount = 0;

    for (const { src } of DIRECTORIES) {
        if (!fs.existsSync(src)) continue;
        const files = collectImageFiles(src);
        for (const filePath of files) {
            try {
                const produced = await buildVariantsForImage(filePath);
                if (produced > 0) {
                    processedCount += 1;
                    variantCount += produced;
                }
            } catch (error) {
                console.warn(`Error generando variantes para ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
            }
        }
    }

    return { processedCount, variantCount };
}

async function minifyJS(file) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(PUBLIC_DIR, file);

    if (!fs.existsSync(src)) {
        console.warn(`Aviso: el archivo ${file} no existe y no se minificará.`);
        return;
    }

    const code = fs.readFileSync(src, 'utf8');
    try {
        const result = await terserMinify(code, {
            compress: {
                dead_code: true,
                drop_console: false,
                drop_debugger: true,
                keep_classnames: true,
                keep_fnames: false,
                passes: 2
            },
            mangle: {
                keep_classnames: true,
                keep_fnames: false
            },
            format: {
                comments: false
            }
        });

        ensureDir(path.dirname(dest));
        fs.writeFileSync(dest, result.code);
        
        const originalSize = (code.length / 1024).toFixed(1);
        const minifiedSize = (result.code.length / 1024).toFixed(1);
        const reduction = ((code.length - result.code.length) / code.length * 100).toFixed(1);
        console.log(`Minified ${file}: ${originalSize}KB -> ${minifiedSize}KB (${reduction}% reduction)`);
    } catch (error) {
        console.error(`Error minifying ${file}:`, error.message);
        // Fallback to copying without minification
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
    }
}

function minifyCSS(file) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(PUBLIC_DIR, file);

    if (!fs.existsSync(src)) {
        console.warn(`Aviso: el archivo ${file} no existe y no se minificará.`);
        return;
    }

    const code = fs.readFileSync(src, 'utf8');
    try {
        const result = new CleanCSS({
            level: 2,
            compatibility: '*'
        }).minify(code);

        ensureDir(path.dirname(dest));
        fs.writeFileSync(dest, result.styles);

        const originalSize = (code.length / 1024).toFixed(1);
        const minifiedSize = (result.styles.length / 1024).toFixed(1);
        const reduction = ((code.length - result.styles.length) / code.length * 100).toFixed(1);
        console.log(`Minified ${file}: ${originalSize}KB -> ${minifiedSize}KB (${reduction}% reduction)`);
    } catch (error) {
        console.error(`Error minifying ${file}:`, error.message);
        // Fallback to copying without minification
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
    }
}

async function run() {
    ensureDir(PUBLIC_DIR);

    STATIC_FILES.forEach(copyFile);
    
    // Minify JS files
    for (const file of MINIFY_FILES.js) {
        await minifyJS(file);
    }
    
    // Minify CSS files
    for (const file of MINIFY_FILES.css) {
        minifyCSS(file);
    }
    
    DIRECTORIES.forEach(({ src, dest }) => copyDirectory(src, dest));

    const { processedCount, variantCount } = await generateResponsiveImages();
    if (sharp) {
        if (processedCount > 0) {
            console.log(`Variantes responsivas generadas: ${variantCount} archivos a partir de ${processedCount} imágenes.`);
        } else {
            console.log('No se encontraron imágenes para generar variantes responsivas.');
        }
        writeResponsiveManifest(responsiveManifest);
    } else {
        writeResponsiveManifest({});
    }

    console.log('\nArchivos procesados y copiados correctamente a la carpeta public');
}

run().catch(error => {
    console.error('Error durante la construcción:', error);
    process.exit(1);
});

