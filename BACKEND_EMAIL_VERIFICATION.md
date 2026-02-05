# Configuration Email Verification - Backend

## Modifications nécessaires dans la base de données

Ajouter un champ `is_verified` (ou `isVerified`) dans la table `users` :
```sql
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN verification_token_expires_at DATETIME NULL;
```

## Endpoints à créer

### 1. POST /api/emails/verify
Envoie l'email de vérification initial après l'inscription
```json
Request:
{
  "email": "user@example.com"
}

Response: 200 OK
```

### 2. POST /api/emails/resend-verification
Renvoie l'email de vérification
```json
Request:
{
  "email": "user@example.com"
}

Response: 200 OK
```

### 3. POST /api/emails/verify-token
Vérifie le token et active le compte
```json
Request:
{
  "token": "abc123..."
}

Response: 200 OK
{
  "message": "Email vérifié avec succès"
}

Error: 400 Bad Request
{
  "message": "Token invalide ou expiré"
}
```

### 4. POST /api/emails/welcome
Envoie l'email de bienvenue après vérification
```json
Request:
{
  "email": "user@example.com",
  "firstName": "John"
}

Response: 200 OK
```

## Logique de vérification

1. **À l'inscription** :
   - Créer l'utilisateur avec `is_verified = false`
   - Générer un token de vérification unique
   - Stocker le token avec une date d'expiration (24h recommandé)
   - Envoyer l'email avec le lien : `myapp://verify-token?token=ABC123`

2. **Lien de vérification** :
   - Format : `myapp://verify-token?token=ABC123`
   - Le lien doit ouvrir l'app et rediriger vers `/(auth)/verify-token`

3. **À la vérification** :
   - Vérifier que le token existe et n'est pas expiré
   - Mettre à jour `is_verified = true`
   - Supprimer le token de vérification
   - Optionnel : envoyer l'email de bienvenue

4. **Retourner isVerified dans l'API** :
   - Ajouter `isVerified` dans la réponse de `/api/me`
   - Ajouter `isVerified` dans la réponse de login

## Configuration SMTP

Credentials Mailtrap (pour le développement) :
```yaml
# .env
MAILER_DSN=smtp://afb35242afd2f1:521cf40fefaba6@sandbox.smtp.mailtrap.io:2525

# Ou avec Symfony Mailer
MAILER_HOST=sandbox.smtp.mailtrap.io
MAILER_PORT=2525
MAILER_USERNAME=afb35242afd2f1
MAILER_PASSWORD=521cf40fefaba6
MAILER_ENCRYPTION=tls
MAILER_AUTH_MODE=login
```

Ports disponibles : 25, 465, 587 ou 2525
Auth : PLAIN, LOGIN et CRAM-MD5
TLS : Optionnel (STARTTLS sur tous les ports)

## Template d'email de vérification

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vérifiez votre email</title>
</head>
<body>
    <h1>Bienvenue sur Kyno !</h1>
    <p>Bonjour {{ firstName }},</p>
    <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre email :</p>
    <a href="myapp://verify-token?token={{ token }}">Vérifier mon email</a>
    <p>Ce lien expire dans 24 heures.</p>
    <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
</body>
</html>
```

## Sécurité

- Le token doit être généré de manière sécurisée (ex: `bin2hex(random_bytes(32))`)
- Le token doit expirer après 24h
- Limiter le nombre de renvois d'email (max 3 par heure par exemple)
- Hasher le token en base de données (optionnel mais recommandé)

## Modifications dans l'entité User (Symfony)

```php
#[ORM\Column(type: 'boolean', options: ['default' => false])]
private bool $isVerified = false;

#[ORM\Column(type: 'string', length: 255, nullable: true)]
private ?string $verificationToken = null;

#[ORM\Column(type: 'datetime', nullable: true)]
private ?\DateTimeInterface $verificationTokenExpiresAt = null;

public function isVerified(): bool
{
    return $this->isVerified;
}

public function setIsVerified(bool $isVerified): self
{
    $this->isVerified = $isVerified;
    return $this;
}
```
