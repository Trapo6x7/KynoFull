<?php

namespace App\Controller;

use App\Contract\Repository\UserRepositoryInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Dépend de UserRepositoryInterface (abstraction), pas de UserRepository (concret) — DIP.
 */
#[Route('/api')]
class UserController extends AbstractController
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {}

    #[Route('/users/professions', name: 'api_users_professions', methods: ['GET'])]
    public function getProfessions(): JsonResponse
    {
        return $this->json($this->userRepository->findDistinctProfessions());
    }
}
