'use strict';

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = path.resolve(__dirname, '../serviceAccount.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('No se encontro serviceAccount.json. Descarga la credencial y colocalo en la raiz del proyecto.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'web-ganbara'
});

const db = admin.firestore();
const { FieldValue } = admin.firestore;

const menuFilePath = path.resolve(__dirname, '../menu-data.json');
if (!fs.existsSync(menuFilePath)) {
    console.error('No se encontro menu-data.json. Asegurate de ejecutar el script en la carpeta del proyecto.');
    process.exit(1);
}

const menuRaw = fs.readFileSync(menuFilePath, 'utf8');
const menuData = JSON.parse(menuRaw);

async function importMenu() {
    const docs = [];
    Object.keys(menuData).forEach(category => {
        const items = Array.isArray(menuData[category]) ? menuData[category] : [];
        items.forEach(item => {
            if (!item || !item.nombre || !item.nombre.es) {
                return;
            }
            docs.push({ category, ...item });
        });
    });

    if (!docs.length) {
        console.log('No se encontraron elementos para importar.');
        return;
    }

    const batch = db.batch();
    const baseTime = Date.now();

    docs.forEach((item, index) => {
        const ref = db.collection('menuItems').doc();
        batch.set(ref, {
            title: {
                es: item.nombre?.es || '',
                eu: item.nombre?.eu || item.nombre?.es || ''
            },
            description: {
                es: item.descripcion?.es || '',
                eu: item.descripcion?.eu || item.descripcion?.es || ''
            },
            category: item.categoria || item.category || 'sin-categoria',
            price: typeof item.precio === 'number' ? item.precio : 0,
            mediaPrice: typeof item.mediaRacion === 'number' ? item.mediaRacion : null,
            isAvailable: item.disponible === undefined ? true : Boolean(item.disponible),
            displayOrder: baseTime + index,
            tags: Array.isArray(item.tags) ? item.tags : [],
            image: {
                desktop: item.imagen || '',
                mobile: item.imagen || ''
            },
            lastUpdated: FieldValue.serverTimestamp()
        });
    });

    await batch.commit();
    console.log(`Importacion completada: ${docs.length} documentos creados.`);
}

importMenu()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error durante la importacion:', error);
        process.exit(1);
    });
