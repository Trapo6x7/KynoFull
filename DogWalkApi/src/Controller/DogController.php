<?php

namespace App\Controller;

use ApiPlatform\Symfony\Security\Exception\AccessDeniedException;
use App\Entity\Dog;
use App\Repository\DogRepository;
use App\Service\DogService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class DogController extends AbstractController
{
    private $dogService;
    private $dogRepository;

    public function __construct(DogService $dogService, DogRepository $dogRepository)
    {
        $this->dogService = $dogService;
        $this->dogRepository = $dogRepository;
    }

    #[Route('/dogs/{id}', name: 'delete_dog', methods: ['DELETE'])]
    public function deleteDog(int $id): Response
    {
       /** @var User $user */
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