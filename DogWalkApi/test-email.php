<?php
// Test simple d'envoi d'email avec Symfony Mailer

require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;

// Récupérer la configuration depuis .env
$dotenv = new Symfony\Component\Dotenv\Dotenv();
$dotenv->load(__DIR__ . '/.env');

$dsn = $_ENV['MAILER_DSN'];
echo "📧 Configuration MAILER_DSN: {$dsn}\n";

try {
    // Créer le transport
    $transport = Transport::fromDsn($dsn);
    $mailer = new Mailer($transport);

    // Créer l'email
    $email = (new Email())
        ->from('noreply@dogwalk.app')
        ->to('test@example.com')
        ->subject('Test Email - DogWalk')
        ->html('<h1>Test d\'envoi d\'email</h1><p>Si vous recevez cet email, la configuration Mailtrap fonctionne !</p>');

    // Envoyer
    echo "📤 Envoi de l'email de test...\n";
    $mailer->send($email);
    echo "✅ Email envoyé avec succès !\n";
    echo "👀 Vérifiez votre inbox Mailtrap : https://mailtrap.io/inboxes\n";

} catch (Exception $e) {
    echo "❌ Erreur : " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
