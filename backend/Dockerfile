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
    curl

# Variables d'environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p data uploads/photos uploads/pdf

# Initialiser la base de données si elle n'existe pas
RUN node src/scripts/initDb.js || true

# Exposer le port
EXPOSE 3001

# Commande de démarrage
CMD ["node", "src/index.js"]
