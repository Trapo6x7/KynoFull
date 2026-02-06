<?php

namespace App\Controller;

use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class LogoutController extends AbstractController
{
    public function __construct(private LoggerInterface $logger) {}

    #[Route('/api/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $userId = $user?->getId();
        $userEmail = $user?->getEmail();
        $token = $request->headers->get('Authorization');
        
        $this->logger->info('🚪 LOGOUT - Début de la déconnexion', [
            'user_id' => $userId,
            'user_email' => $userEmail,
            'has_token' => !empty($token),
            'ip' => $request->getClientIp(),
            'user_agent' => $request->headers->get('User-Agent')
        ]);

        if ($user) {
            $this->logger->info('✅ LOGOUT - Utilisateur authentifié détecté', [
                'user_id' => $userId,
                'user_email' => $userEmail
            ]);
        } else {
            $this->logger->warning('⚠️ LOGOUT - Aucun utilisateur authentifié', [
                'has_token' => !empty($token)
            ]);
        }

        $this->logger->info('✅ LOGOUT - Déconnexion réussie', [
            'user_id' => $userId,
            'message' => 'Token doit être supprimé côté client'
        ]);

        return $this->json([
            'message' => 'Déconnexion réussie. Supprimez le token côté client.',
            'user_id' => $userId
        ]);
    }
}
