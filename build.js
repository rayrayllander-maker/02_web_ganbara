const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const STATIC_FILES = [
    'index.html',
    'styles.css',
    'script.js',
    'translations.js',
    'analytics.js',
    'menu-data.json',
    'hero-carousel.json',
    'firebase-init.js'
];

const DIRECTORIES = [
    { src: path.join(ROOT_DIR, 'assets'), dest: path.join(PUBLIC_DIR, 'assets') },
    { src: path.join(ROOT_DIR, 'images'), dest: path.join(PUBLIC_DIR, 'images') }
];

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

function run() {
    ensureDir(PUBLIC_DIR);

    STATIC_FILES.forEach(copyFile);
    DIRECTORIES.forEach(({ src, dest }) => copyDirectory(src, dest));

    console.log('Archivos copiados correctamente a la carpeta public');
}

run();
