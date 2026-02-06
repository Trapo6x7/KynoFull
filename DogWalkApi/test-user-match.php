<?php
// Test rapide de l'entité UserMatch

require_once __DIR__ . '/vendor/autoload.php';

use App\Entity\UserMatch;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->bootEnv(__DIR__.'/.env');

$kernel = new \App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();

/** @var EntityManagerInterface $em */
$em = $container->get('doctrine.orm.entity_manager');

// Récupérer 2 users pour tester
$userRepo = $em->getRepository(User::class);
$users = $userRepo->findAll();

if (count($users) < 2) {
    echo "❌ Il faut au moins 2 utilisateurs en base\n";
    exit(1);
}

$user1 = $users[0];
$user2 = $users[1];

echo "✅ Users trouvés:\n";
echo "  - User 1: {$user1->getEmail()} (ID: {$user1->getId()})\n";
echo "  - User 2: {$user2->getEmail()} (ID: {$user2->getId()})\n\n";

// Créer un match
$match = new UserMatch();
$match->setUser($user1);
$match->setTargetUser($user2);
$match->setAction(UserMatch::ACTION_LIKE);
$match->setMatchScore('75.50');

try {
    $em->persist($match);
    $em->flush();
    echo "✅ UserMatch créé avec succès (ID: {$match->getId()})\n";
    echo "  - Action: {$match->getAction()}\n";
    echo "  - Score: {$match->getMatchScore()}\n";
    echo "  - Date: {$match->getCreatedAt()->format('Y-m-d H:i:s')}\n\n";
    
    // Vérifier qu'on peut le récupérer
    $matchRepo = $em->getRepository(UserMatch::class);
    $found = $matchRepo->find($match->getId());
    
    if ($found) {
        echo "✅ UserMatch récupéré depuis la BDD\n";
        echo "  - User: {$found->getUser()->getEmail()}\n";
        echo "  - Target: {$found->getTargetUser()->getEmail()}\n";
    }
    
    // Nettoyer
    $em->remove($match);
    $em->flush();
    echo "\n✅ Test terminé avec succès!\n";
    
} catch (\Exception $e) {
    echo "❌ Erreur: {$e->getMessage()}\n";
    echo "Stack trace:\n{$e->getTraceAsString()}\n";
}
