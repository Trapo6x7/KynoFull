<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class UserController extends AbstractController
{
    #[Route('/users/professions', name: 'api_users_professions', methods: ['GET'])]
    public function getProfessions(UserRepository $userRepository): JsonResponse
    {
        $professions = $userRepository->findDistinctProfessions();
        
        return $this->json($professions);
    }
}
