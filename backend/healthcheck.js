/**
 * Script de healthcheck pour Docker
 * Vérifie que le serveur backend répond correctement
 */

const http = require('http');

const options = {
  hostname: '127.0.0.1', // ✅ IPv4 explicite pour éviter les problèmes de résolution
  port: 3001,
  path: '/api/sante',
  method: 'GET',
  timeout: 5000 // 5 secondes
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      process.exit(0); // ✅ Succès
    } else {
      console.error(`Healthcheck failed: Status ${res.statusCode}`);
      process.exit(1); // ❌ Échec
    }
  });
});

req.on('error', (error) => {
  console.error(`Healthcheck failed: ${error.message}`);
  process.exit(1); // ❌ Échec
});

req.on('timeout', () => {
  console.error('Healthcheck failed: Timeout');
  req.destroy();
  process.exit(1); // ❌ Échec
});

// Définir le timeout sur la requête
req.setTimeout(options.timeout);

req.end();

