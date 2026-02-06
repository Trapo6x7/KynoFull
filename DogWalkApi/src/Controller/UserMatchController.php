<?php

namespace App\Controller;

use App\Repository\UserMatchRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class UserMatchController
{
    public function __construct(private readonly UserMatchRepository $matchRepository, private readonly Security $security)
    {
    }

    #[Route('/api/user_matches/seen', name: 'api_user_matches_seen', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        $user = $this->security->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], 401);
        }

        $ids = $this->matchRepository->getUsersAlreadySeen($user);

        return new JsonResponse(array_values($ids));
    }
}
