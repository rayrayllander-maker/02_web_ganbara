const admin = require('firebase-admin');
const path = require('path');

const sa = require(path.resolve(__dirname, '../serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(sa),
  projectId: 'web-ganbara'
});

admin.auth().setCustomUserClaims('hX4gIYZe08W2CJSokUL1ccnUxNg2', { admin: true })
  .then(() => { console.log('Claim admin aplicada'); process.exit(0); })
  .catch(err => { console.error('Error asignando claim:', err); process.exit(1); });