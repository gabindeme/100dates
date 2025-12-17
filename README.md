# 100 Dates 💕

Une application web pour gérer et suivre vos idées de dates en couple. Créez des souvenirs, suivez vos réalisations et trouvez l'inspiration pour vos prochains rendez-vous !

## Fonctionnalités

🏠 **Dashboard** - Vue d'ensemble avec statistiques, dernière date réalisée et suggestions aléatoires

❤️ **Nos Dates** - Liste complète de toutes vos idées de dates avec :
- Recherche instantanée
- Filtrage par catégorie et statut
- Tri alphabétique ou par date
- Pagination (25/50/75/tous)
- Création de nouvelles catégories avec couleur personnalisée

📷 **Souvenirs** - Timeline animée de vos dates réalisées avec :
- Animation au scroll
- Affichage chronologique (plus récent en haut)
- Notes et anecdotes
- Temps relatif ("Il y a 3 jours", etc.)

## Stack Technique

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## Prérequis

- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) v10+
- [MongoDB](https://www.mongodb.com/) v8+

## Installation

### Backend

```bash
cd server
pnpm install
```

Créer un fichier `.env` :
```env
PORT=5000
MONG_URI=mongodb://localhost:27017/100dates
SECRET_ACCESS_TOKEN=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

### Frontend

```bash
cd client
pnpm install
```

Créer un fichier `.env` :
```env
VITE_API_URL=http://localhost:5000
```

## Démarrage

**Terminal 1 - Backend :**
```bash
cd server
pnpm dev
```

**Terminal 2 - Frontend :**
```bash
cd client
pnpm dev
```

Ouvrir [http://localhost:5173](http://localhost:5173)

## Import des données

Pour importer les dates initiales dans MongoDB Compass :
1. Ouvrez MongoDB Compass
2. Connectez-vous à votre base
3. Sélectionnez la collection `dates`
4. Cliquez sur "Add Data" → "Import JSON"
5. Sélectionnez le fichier `dates.json`

## Catégories par défaut

- 💕 Romantique (rose)
- 🎭 Culture (violet)
- 🌄 Aventure (orange)
- 🍽️ Gastronomie (jaune)
- ⚽ Sport (vert)
- 🧘 Détente (bleu)

## Structure du projet

```
100dates/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── pages/          # Pages (Home, DateIdeas, Souvenirs)
│   │   ├── locales/        # Traductions FR/EN
│   │   └── router/         # Configuration des routes
│   └── ...
├── server/                 # Backend Express
│   ├── src/
│   │   ├── controllers/    # Logique métier
│   │   ├── models/         # Schémas Mongoose
│   │   ├── routes/         # Endpoints API
│   │   └── middlewares/    # Auth, validation
│   └── ...
└── dates.json              # Données initiales
```

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dates` | Liste des dates (filtres, tri, pagination) |
| POST | `/api/dates` | Créer une date |
| PUT | `/api/dates/:id` | Modifier une date |
| DELETE | `/api/dates/:id` | Supprimer une date |
| PATCH | `/api/dates/:id/toggle` | Marquer comme réalisée |
| GET | `/api/categories` | Liste des catégories |
| POST | `/api/categories` | Créer une catégorie |

## Auteur

Basé sur le [MERN Boilerplate](https://github.com/teovlt) de Téo Villet.
