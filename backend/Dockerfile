# Backend Dockerfile - CardPrint Pro
FROM node:18-alpine

# Installer les dépendances système pour better-sqlite3 et Puppeteer
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    pcsc-lite \
    pcsc-lite-dev

# Variables d'environnement pour Puppeteer et NFC
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NFC_SIMULATION_MODE=true \
    NODE_ENV=production

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p data uploads/photos uploads/pdf templates

# Initialiser la base de données si elle n'existe pas
RUN node src/scripts/initDb.js || true

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/sante || exit 1

# Exposer le port
EXPOSE 3001

# Commande de démarrage avec message de bienvenue
CMD ["node", "src/index.js"]
