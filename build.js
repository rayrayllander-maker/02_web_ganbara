const fs = require('fs');
const path = require('path');
const { minify: terserMinify } = require('terser');
const CleanCSS = require('clean-css');

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

    console.log('\nArchivos procesados y copiados correctamente a la carpeta public');
}

run();

