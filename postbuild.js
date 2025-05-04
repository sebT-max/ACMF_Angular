const fs = require('fs');
const path = require('path');

const distRoot = path.join(__dirname, 'dist', 'auto-ecole');
const browserDir = path.join(distRoot, 'browser');

// Créer le fichier _redirects dans browser/
const redirectsContent = `
# Redirection de la racine vers /fr/
/  /fr/  301!

# Redirection SPA pour le dossier fr
/fr/*  /fr/index.html  200

# Redirection des fichiers vers leur emplacement réel
/*.js  /:splat.js  200
/*.css  /:splat.css  200
`;

const redirectsTarget = path.join(browserDir, '_redirects');

// Créer le fichier _headers dans browser/
const headersContent = `
# JavaScript files
/*.js
  Content-Type: application/javascript

# CSS files
/*.css
  Content-Type: text/css

# Font files
/*.ttf
  Content-Type: font/ttf
/*.woff
  Content-Type: font/woff
/*.woff2
  Content-Type: font/woff2
`;

const headersTarget = path.join(browserDir, '_headers');

// S'assurer que les dossiers existent
fs.mkdirSync(browserDir, { recursive: true });

// Écrire les fichiers
fs.writeFileSync(redirectsTarget, redirectsContent);
console.log('_redirects créé dans :', redirectsTarget);

fs.writeFileSync(headersTarget, headersContent);
console.log('_headers créé dans :', headersTarget);

// Créer un fichier index.html de redirection à la racine si nécessaire
const rootIndexPath = path.join(browserDir, 'index.html');
if (!fs.existsSync(rootIndexPath)) {
  const indexContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; URL=/fr/">
  <link rel="canonical" href="/fr/">
</head>
<body>
  <p>Redirection vers le site en français...</p>
</body>
</html>
`;
  fs.writeFileSync(rootIndexPath, indexContent);
  console.log('index.html de redirection créé dans :', rootIndexPath);
}
