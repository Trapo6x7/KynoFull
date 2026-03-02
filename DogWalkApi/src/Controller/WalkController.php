<?php

namespace App\Controller;

use App\Contract\Repository\WalkRepositoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * Respecte DIP : dépend de WalkRepositoryInterface (abstraction),
 * pas de WalkRepository (implémentation Doctrine concrète).
 * Injection constructeur au lieu de l'injection de paramètre (PHP méthode) pour
 * rendre les dépendances explicites et testables.
 */
class WalkController
{
    public function __construct(
        private readonly WalkRepositoryInterface $walkRepository,
        private readonly SerializerInterface $serializer
    ) {}

    #[Route('/groups/{id}/walks', name: 'get_group_walks', methods: ['GET'])]
    public function getGroupWalks(int $id): JsonResponse
    {
        $walks = $this->walkRepository->findBy(['walkGroup' => $id]);

        $jsonWalks = $this->serializer->serialize($walks, 'json', ['groups' => ['walk:read']]);

        return new JsonResponse($jsonWalks, JsonResponse::HTTP_OK, [], true);
    }
}
