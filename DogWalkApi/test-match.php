<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Entity\User;
use App\Entity\UserMatch;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->bootEnv(__DIR__.'/.env');

$kernel = new \App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();

/** @var EntityManagerInterface $em */
$em = $container->get('doctrine.orm.entity_manager');

// Récupérer 2 users
$userRepo = $em->getRepository(User::class);
$users = $userRepo->findAll();

if (count($users) < 2) {
    echo "❌ Il faut au moins 2 utilisateurs\n";
    exit(1);
}

$user1 = $users[0];
$user2 = $users[1];

echo "✅ Users:\n";
echo "  - User 1: {$user1->getEmail()} (ID: {$user1->getId()})\n";
echo "  - User 2: {$user2->getEmail()} (ID: {$user2->getId()})\n\n";

// Tester la création d'un match
try {
    $match = new UserMatch();
    $match->setUser($user1);
    $match->setTargetUser($user2);
    $match->setAction(UserMatch::ACTION_LIKE);
    
    echo "📝 Tentative de persist...\n";
    $em->persist($match);
    
    echo "💾 Tentative de flush...\n";
    $em->flush();
    
    echo "✅ Match créé avec succès (ID: {$match->getId()})\n";
    
    // Nettoyer
    $em->remove($match);
    $em->flush();
    echo "🗑️ Match supprimé\n";
    
} catch (\Exception $e) {
    echo "❌ ERREUR: {$e->getMessage()}\n";
    echo "📍 Fichier: {$e->getFile()}:{$e->getLine()}\n";
    echo "📚 Stack trace:\n{$e->getTraceAsString()}\n";
}
