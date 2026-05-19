# CoasterPlay API

REST API de gestion de parcs d'attractions, construite comme base de live coding pour le cours M1 Dev API.

## Stack

| Couche | Technologie |
|---|---|
| Runtime | Node.js 25 / TypeScript |
| Framework | NestJS 11 |
| ORM | Prisma 7 |
| Base de données | PostgreSQL 18 |
| Auth | Better Auth (email/password + JWT) |
| Tests | Jest + Testcontainers |
| HTTP client | Bruno |

## Domaine

```
Park ──< RollerCoaster ──< Review
  │                          │
  └──< Ticket >── User ──────┘
```

- **Parks** : parcs d'attractions (nom, ville, pays, statut actif)
- **RollerCoasters** : montagnes russes rattachées à un parc (hauteur minimale, vitesse max, niveau de sensations)
- **Reviews** : avis d'un utilisateur sur une montagne russe (note + commentaire, une seule par user/coaster)
- **Tickets** : entrées d'un utilisateur pour un parc (date de visite, prix)
- **Users** : gérés via Better Auth (inscription, connexion, JWT)

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommandé)
- ou Node.js 20+ et Yarn 4 installés localement

## Démarrage rapide (Docker)

```bash
# 1. Configurer l'environnement
cp .env.sample .env

# 2. Lancer l'API + la base de données
docker compose up --build

# L'API est disponible sur http://localhost:3000
# L'inspecteur Node.js est disponible sur le port 9229
```

Au démarrage, Docker exécute automatiquement les migrations Prisma avant de lancer le serveur.

## Démarrage local (sans Docker)

```bash
# 1. Installer les dépendances
yarn install

# 2. Configurer l'environnement
cp .env.sample .env
# Éditer .env : pointer DATABASE_URL vers localhost:4321 (voir commentaire dans le fichier)

# 3. Démarrer la base de données seule
docker compose up postgres -d

# 4. Appliquer les migrations et générer le client Prisma
yarn db:migrate

# 5. Lancer le serveur en mode watch
yarn start:dev
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute de l'API (défaut : `3000`) |
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `POSTGRES_USER` | Utilisateur PostgreSQL (pour le container) |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL (pour le container) |
| `POSTGRES_DB` | Nom de la base (pour le container) |
| `BETTER_AUTH_SECRET` | Clé secrète pour Better Auth (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | URL publique de l'API (ex : `http://localhost:3000`) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Origines autorisées (séparées par des virgules) |

## Endpoints

### Auth (`/auth`)

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/auth/sign-up/email` | Inscription |
| `POST` | `/auth/sign-in/email` | Connexion (retourne un cookie de session) |
| `POST` | `/auth/sign-out` | Déconnexion |
| `GET` | `/auth/token` | Obtenir un JWT access token |

### Parks (`/parks`)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/parks` | Lister tous les parcs |
| `POST` | `/parks` | Créer un parc |
| `GET` | `/parks/:id` | Récupérer un parc |
| `PATCH` | `/parks/:id` | Mettre à jour un parc |
| `DELETE` | `/parks/:id` | Supprimer un parc |
| `GET` | `/parks/:id/roller-coasters` | Lister les montagnes russes d'un parc (`?isOperational=true`) |

### Roller Coasters (`/roller-coasters`)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/roller-coasters` | Lister toutes les montagnes russes |
| `POST` | `/roller-coasters` | Créer une montagne russe |
| `GET` | `/roller-coasters/:id` | Récupérer une montagne russe |
| `PATCH` | `/roller-coasters/:id` | Mettre à jour |
| `DELETE` | `/roller-coasters/:id` | Supprimer |

### Users (`/users`)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/users` | Lister les utilisateurs |
| `GET` | `/users/:id` | Récupérer un utilisateur |
| `PATCH` | `/users/:id` | Mettre à jour |
| `DELETE` | `/users/:id` | Supprimer |

### Reviews (`/reviews`)

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/reviews` | Lister les avis |
| `POST` | `/reviews` | Créer un avis (authentifié) |

## Base de données

```bash
yarn db:migrate      # Créer et appliquer une nouvelle migration
yarn db:generate     # Régénérer le client Prisma après modif du schéma
yarn db:studio       # Ouvrir Prisma Studio (interface graphique)
yarn db:push         # Pousser le schéma sans migration (prototypage)
yarn db:reset        # Réinitialiser la base (supprime toutes les données)
```

PostgreSQL est exposé sur `localhost:4321` pour les outils locaux (Prisma Studio, TablePlus, psql).

## Tests

```bash
yarn test            # Tests unitaires
yarn test:watch      # Mode watch
yarn test:cov        # Couverture de code
yarn test:e2e        # Tests end-to-end (Testcontainers — démarre un PostgreSQL éphémère)
```

## Client HTTP (Bruno)

Une collection Bruno est disponible dans le dossier `./bruno`. Elle couvre toutes les routes avec un environnement `Development` préconfiguré sur `http://localhost:3000`.

Ouvrir Bruno → "Open Collection" → sélectionner le dossier `./bruno`.

## Structure du projet

```
src/
├── common/          # Décorateurs, pipes et filtres partagés
├── lib/             # Configuration Better Auth
├── parks/           # Module Parks (controller, service, repository, DTOs)
├── roller-coasters/ # Module RollerCoasters
├── reviews/         # Module Reviews
├── users/           # Module Users
├── prisma/          # Module Prisma (service injectable)
└── main.ts          # Bootstrap de l'application
prisma/
└── schema.prisma    # Schéma de base de données
bruno/               # Collection de requêtes HTTP
```
