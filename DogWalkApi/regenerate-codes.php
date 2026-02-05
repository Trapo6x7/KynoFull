<?php

require_once __DIR__ . '/vendor/autoload.php';

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use Symfony\Component\Dotenv\Dotenv;

// Charger les variables d'environnement
$dotenv = new Dotenv();
$dotenv->bootEnv(__DIR__.'/.env');

// Bootstrap Symfony
$kernel = new \App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();

/** @var EntityManagerInterface $entityManager */
$entityManager = $container->get('doctrine.orm.entity_manager');

// Récupérer tous les utilisateurs sans code de vérification
$userRepository = $entityManager->getRepository(User::class);
$users = $userRepository->findAll();

$updated = 0;

foreach ($users as $user) {
    // Si l'utilisateur n'a pas de code de vérification, en générer un
    if (!$user->getVerificationCode()) {
        $verificationCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->setVerificationCode($verificationCode);
        $user->setVerificationCodeExpiresAt(new \DateTimeImmutable('+24 hours'));
        $updated++;
        
        echo "✅ Code généré pour {$user->getEmail()}: {$verificationCode}\n";
    }
}

if ($updated > 0) {
    $entityManager->flush();
    echo "\n✅ {$updated} utilisateur(s) mis à jour\n";
} else {
    echo "\nℹ️  Aucun utilisateur à mettre à jour\n";
}
