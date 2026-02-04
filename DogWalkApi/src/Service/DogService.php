<?php

namespace App\Service;

use App\Entity\Dog;
use App\Repository\DogRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Doctrine\ORM\EntityManagerInterface; 

class DogService
{
    private $dogRepository;
    private $security;
    private $entityManager;
    public function __construct(DogRepository $dogRepository, Security $security, EntityManagerInterface $entityManager)
    {
        $this->dogRepository = $dogRepository;
        $this->security = $security;
        $this->entityManager = $entityManager;  
    }

    public function deleteDog(int $dogId): bool
    {
       /** @var User $user */
        $user = $this->security->getUser();

        if (!$user) {
            throw new AccessDeniedException('Utilisateur non connecté');
        }

       
        $dog = $this->dogRepository->find($dogId);
        if (!$dog) {
            throw new \Exception('Chien non trouvé');
        }
        
        
        if ($dog->getUser()->getId() !== $user->getId()) {
            throw new AccessDeniedException('Vous ne pouvez supprimer que vos propres chiens');
        }

        
        $this->entityManager->remove($dog); 
        $this->entityManager->flush();      

        return true;
    }
}
