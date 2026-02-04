<?php

namespace App\Controller;

use App\Entity\Walk;
use App\Repository\WalkRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

class WalkController
{
    #[Route('/groups/{id}/walks', name: 'get_group_walks', methods: ['GET'])]
    public function getGroupWalks(int $id, WalkRepository $walkRepository, SerializerInterface $serializer): JsonResponse
    {
        $walks = $walkRepository->findBy(['walkGroup' => $id]);

        // Sérialise les données en JSON
        $jsonWalks = $serializer->serialize($walks, 'json', ['groups' => ['walk:read']]);

        return new JsonResponse($jsonWalks, JsonResponse::HTTP_OK, [], true);
    }
}
