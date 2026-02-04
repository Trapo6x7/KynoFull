# DogWalk API (Backend)

API REST construite avec Symfony 6 et API Platform pour gérer les promenades de chiens.

## Prérequis

- PHP 8.1+
- Composer
- Base de données MySQL ou PostgreSQL
- OpenSSL (pour la génération de clés JWT)
- (Optionnel) Docker et Docker Compose

## Installation

1. Cloner le dépôt et se placer dans `DOGWALKAPI`
2. Installer les dépendances :
   ```powershell
   composer install
   ```
3. Créer la base de données et exécuter les migrations :
   ```powershell
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   ```
4. Générer les clés JWT :
   ```powershell
   php bin/console lexik:jwt:generate-keypair
   ```

## Configuration

Copier `.env.local` depuis `.env` ou `.env.dist` et ajuster :

```ini
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/dogwalk"
JWT_PASSPHRASE="<votre_passphrase>"
```

## Lancer le serveur

```powershell
symfony server:start --port=8000
```

## Tests

```powershell
php bin/phpunit
```

## Contribuer

Les pull requests et issues sont les bienvenues. Merci de respecter les standards PSR-12 et les bonnes pratiques Symfony.
