<?php

namespace App\Controller;

use ApiPlatform\Symfony\Security\Exception\AccessDeniedException;
use App\Contract\Repository\DogRepositoryInterface;
use App\Entity\Dog;
use App\Service\DogService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Respecte DIP : dépend de DogRepositoryInterface (abstraction), pas de DogRepository.
 * Injection constructeur : dépendances explicites, testables.
 */
class DogController extends AbstractController
{
    public function __construct(
        private readonly DogService $dogService,
        private readonly DogRepositoryInterface $dogRepository
    ) {}

    #[Route('/dogs/{id}', name: 'delete_dog', methods: ['DELETE'])]
    public function deleteDog(int $id): Response
    {
        /** @var \App\Entity\User $user */
        $user = $this->getUser();
        $dog = $this->dogRepository->find($id);


    if (!$dog) {
        return $this->json(['message' => 'Chien non trouvé'], Response::HTTP_NOT_FOUND);
    }

    if ($dog->getUser()->getId() !== $user->getId()) {
        throw new AccessDeniedException('Vous ne pouvez supprimer que vos propres chiens');
    }

    try {
        $this->dogService->deleteDog($id);
        return $this->json(['message' => 'Chien supprimé avec succès'], Response::HTTP_OK);
    } catch (\Exception $e) {
        return $this->json(['message' => $e->getMessage()], Response::HTTP_FORBIDDEN);
    }
    }
}