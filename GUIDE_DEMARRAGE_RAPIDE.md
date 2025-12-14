# Guide de Démarrage Rapide

Ce guide vous permettra de lancer l'application en quelques minutes.

## Prérequis

- Node.js 18+ installé ([nodejs.org](https://nodejs.org/))
- Git installé ([git-scm.com](https://git-scm.com/))

## Installation en 5 étapes

### 1. Cloner le projet

```bash
git clone https://github.com/MoctarSidibe/module_impression.git
cd module_impression
```

### 2. Installer le Backend

```bash
cd backend
npm install
npm run init-db
```

### 3. Installer le Frontend

```bash
cd ../frontend
npm install
```

### 4. Lancer l'application

**Ouvrez 2 terminaux :**

Terminal 1 (Backend) :
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend) :
```bash
cd frontend
npm run dev
```

### 5. Ouvrir l'application

Allez sur **http://localhost:3000** dans votre navigateur.

## Premiers pas

1. **Accueil** : Visualisez le tableau de bord
2. **Utilisateurs** : Ajoutez des personnes à la base de données
3. **Templates** : Créez ou modifiez des modèles de cartes
4. **Impression** : Sélectionnez un utilisateur + template et imprimez

## En cas de problème

Consultez le fichier `README.md` pour le dépannage complet.

---

Bon développement !
