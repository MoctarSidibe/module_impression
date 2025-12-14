# CardPrint Pro - Module d'Impression de Cartes NFC

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-6366f1.svg?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-10b981.svg?style=for-the-badge)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg?style=for-the-badge)
![Docker](https://img.shields.io/badge/docker-ready-2496ed.svg?style=for-the-badge)
![Licence](https://img.shields.io/badge/licence-MIT-f59e0b.svg?style=for-the-badge)

**Application web professionnelle pour l'impression automatisée de cartes plastiques avec encodage NFC**

Compatible avec l'imprimante **Luca 40 KM Retransfer** et les cartes **NTAG 216**

[Fonctionnalités](#-fonctionnalités) •
[Installation Docker](#-installation-rapide-avec-docker) •
[Installation Manuelle](#-installation-manuelle) •
[Utilisation](#-utilisation)

</div>

---

## Aperçu

L'application dispose d'une interface moderne et professionnelle avec :
- Thème sombre élégant avec effets de glassmorphism
- Éditeur de templates drag-and-drop style CardPresso
- Dashboard interactif avec statistiques en temps réel
- Design responsive pour tous les écrans (desktop, tablette, mobile)

---

## Fonctionnalités

### Gestion des Utilisateurs
- Base de données SQLite pour stocker les informations
- Recherche et filtres avancés
- Upload de photos d'identité
- Informations permis de conduire

### Éditeur de Templates Professionnel
- **Interface drag-and-drop** similaire à CardPresso
- Éléments disponibles :
  - Texte statique et dynamique (variables)
  - Images et photos d'identité
  - Formes (rectangles, cercles)
  - QR Codes dynamiques
- Propriétés personnalisables (couleurs, polices, opacité, rotation)
- Support recto/verso
- Templates pré-construits professionnels
- **Interface responsive** (desktop, tablette, mobile)

### Impression Automatique
- Génération PDF au format carte CR80 (85.6mm × 53.98mm)
- Résolution 300 DPI
- Envoi direct vers l'imprimante Luca 40 KM
- Aperçu avant impression

### Encodage NFC (NTAG 216)
- **Type de carte supporté : NTAG 216**
  - Mémoire : 888 bytes utilisables
  - UID unique 7 bytes
  - Protection par mot de passe disponible
- Encodage automatique lors de l'impression
- Mode simulation si pas de lecteur NFC

### Historique & Statistiques
- Suivi de toutes les impressions
- Statistiques de réussite/erreurs
- Réimpression en un clic

---

## Installation Rapide avec Docker

### Prérequis

| Logiciel | Version | Lien |
|----------|---------|------|
| Docker | Dernière | [docker.com](https://www.docker.com/get-started) |
| Docker Compose | Dernière | Inclus avec Docker Desktop |

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/MoctarSidibe/module_impression.git
cd module_impression
```

### Étape 2 : Lancer avec Docker Compose

```bash
docker-compose up -d
```

C'est tout ! L'application est maintenant accessible sur **http://localhost:3000**

### Commandes Docker utiles

```bash
# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Reconstruire après modifications
docker-compose up -d --build

# Voir l'état des conteneurs
docker-compose ps
```

---

## Installation Manuelle

### Prérequis

| Logiciel | Version | Lien |
|----------|---------|------|
| Node.js | ≥ 18.0.0 | [nodejs.org](https://nodejs.org/) |
| Git | Dernière | [git-scm.com](https://git-scm.com/) |

### Étape 1 : Cloner le dépôt

```bash
git clone https://github.com/MoctarSidibe/module_impression.git
cd module_impression
```

### Étape 2 : Installer le Backend

```bash
cd backend
npm install
```

> **Windows** : Si `better-sqlite3` échoue, exécutez d'abord :
> ```bash
> npm install --global windows-build-tools
> ```

### Étape 3 : Initialiser la base de données

```bash
npm run init-db
```

Cette commande crée :
- La base de données SQLite
- 5 utilisateurs de démonstration
- 3 templates prêts à l'emploi

### Étape 4 : Installer le Frontend

```bash
cd ../frontend
npm install
```

### Étape 5 : Lancer l'application

Ouvrez **2 terminaux** :

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
```
Serveur sur `http://localhost:3001`

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```
Application sur `http://localhost:3000`

### Étape 6 : Ouvrir l'application

Ouvrez votre navigateur sur **http://localhost:3000**

---

## Utilisation

### 1. Ajouter un utilisateur

1. Allez dans **Utilisateurs**
2. Cliquez sur **Nouvel Utilisateur**
3. Remplissez les onglets (Identité, Coordonnées, Permis)
4. Cliquez sur **Créer**

### 2. Créer un template

1. Allez dans **Templates**
2. Utilisez un modèle prédéfini ou créez le vôtre
3. Dans l'éditeur :
   - Cliquez sur les éléments depuis le panel gauche pour les ajouter
   - Personnalisez dans le panel droit (propriétés)
   - Utilisez les variables : `{{nom}}`, `{{prenom}}`, `{{photo_url}}`...
   - Basculez entre Recto/Verso avec les onglets

### 3. Imprimer une carte

1. Allez dans **Impression**
2. Sélectionnez un utilisateur
3. Choisissez un template
4. Activez l'encodage NFC si nécessaire
5. Cliquez sur **Lancer l'impression**

---

## Technologies

### Backend
| Technologie | Description |
|-------------|-------------|
| Express.js | Serveur web |
| better-sqlite3 | Base de données SQLite |
| Puppeteer | Génération PDF |
| Handlebars | Moteur de templates |
| nfc-pcsc | Communication NFC |

### Frontend
| Technologie | Description |
|-------------|-------------|
| React 18 | Framework UI |
| Material-UI 5 | Composants graphiques |
| Framer Motion | Animations |
| react-color | Sélecteur de couleurs |
| Vite | Bundler |

### Infrastructure
| Technologie | Description |
|-------------|-------------|
| Docker | Conteneurisation |
| Docker Compose | Orchestration |
| Nginx | Serveur web production |

---

## Structure du Projet

```
module_impression/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── config/         # Configuration BDD
│   │   ├── models/         # Modèles de données
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Services (PDF, Print, NFC)
│   │   └── index.js        # Point d'entrée
│   ├── data/               # Base de données
│   └── uploads/            # Fichiers uploadés
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── services/       # Client API
│   │   ├── styles/         # CSS global
│   │   ├── theme.js        # Thème MUI
│   │   └── App.jsx         # Application principale
│   └── index.html
│
├── docker-compose.yml
├── README.md
├── LICENSE
└── .gitignore
```

---

## API REST

### Utilisateurs
```
GET    /api/utilisateurs           # Liste tous
GET    /api/utilisateurs/:id       # Récupère un
POST   /api/utilisateurs           # Crée
PUT    /api/utilisateurs/:id       # Modifie
DELETE /api/utilisateurs/:id       # Supprime
```

### Templates
```
GET    /api/templates              # Liste tous
POST   /api/templates              # Crée
POST   /api/templates/:id/apercu   # Aperçu HTML
```

### Impression
```
GET    /api/impression             # Historique
POST   /api/impression             # Lance impression
POST   /api/impression/apercu      # Aperçu PDF
```

### NFC
```
GET    /api/nfc/status             # Statut lecteur (NTAG 216)
POST   /api/nfc/ecrire             # Encode une carte
```

---

## Configuration Imprimante & Cartes

### Luca 40 KM Retransfer

| Paramètre | Valeur |
|-----------|--------|
| Format carte | CR80 (85.6mm × 53.98mm) |
| Résolution | 300 DPI |
| Technologie | Retransfer Film |
| NFC | NTAG 216 supporté |

### Cartes NTAG 216

| Paramètre | Valeur |
|-----------|--------|
| Mémoire totale | 924 bytes |
| Mémoire utilisable | 888 bytes |
| UID | 7 bytes (unique) |
| Pages | 231 pages de 4 bytes |
| Protection | Mot de passe disponible |
| Compatibilité | ISO/IEC 14443-3A, NFC Forum Type 2 |

---

## Dépannage

### L'installation de better-sqlite3 échoue

**Windows :**
```bash
npm install --global windows-build-tools
```

**macOS :**
```bash
xcode-select --install
```

### Puppeteer ne trouve pas Chrome

```bash
npx puppeteer browsers install chrome
```

### Le lecteur NFC n'est pas détecté

L'application fonctionne en **mode simulation** si aucun lecteur n'est détecté.

### Docker ne démarre pas

Vérifiez que Docker Desktop est lancé, puis :
```bash
docker-compose down
docker-compose up -d --build
```

---

## Contribuer

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Committez (`git commit -m 'Ajout de fonctionnalité'`)
4. Pushez (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

---

## Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## Auteur

**Moctar Sidibe**

[![GitHub](https://img.shields.io/badge/GitHub-MoctarSidibe-181717?style=for-the-badge&logo=github)](https://github.com/MoctarSidibe)

---

<div align="center">

**Si ce projet vous a aidé, n'hésitez pas à lui donner une étoile !**

</div>
