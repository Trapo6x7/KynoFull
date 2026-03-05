<?php
// promote-admin.php
require_once __DIR__ . '/vendor/autoload.php';

use App\Entity\User;
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->bootEnv(__DIR__.'/.env');

$kernel = new \App\Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine.orm.entity_manager');

$email = $argv[1] ?? null;
if (!$email) {
    echo "Usage: php promote-admin.php email@example.com\n";
    exit(1);
}

$user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
if (!$user) {
    echo "❌ Utilisateur non trouvé\n";
    exit(1);
}

$user->setRoles(['ROLE_USER', 'ROLE_ADMIN']);
$em->flush();

echo "✅ {$email} est maintenant admin\n";
