const fs = require('fs');
const path = require('path');

const redirectsContent = '/*    /index.html   200\n';
const lang = 'fr';

const distRoot = path.join(__dirname, 'dist', 'auto-ecole');
const localizedOutputDir = path.join(distRoot, 'browser', lang);
const topLevelTarget = path.join(distRoot, '_redirects');
const localizedTarget = path.join(localizedOutputDir, '_redirects');

// Crée les dossiers si nécessaires
fs.mkdirSync(localizedOutputDir, { recursive: true });
fs.mkdirSync(distRoot, { recursive: true });

// Écrit le fichier dans le dossier localisé
fs.writeFileSync(localizedTarget, redirectsContent);
console.log('_redirects créé dans :', localizedTarget);

// Copie à la racine du dossier dist
fs.copyFileSync(localizedTarget, topLevelTarget);
console.log('_redirects aussi copié dans :', topLevelTarget);


