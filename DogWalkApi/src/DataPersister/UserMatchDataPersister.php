<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Entity\UserMatch;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class UserMatchDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): UserMatch
    {
        if ($data instanceof UserMatch && $operation instanceof Post) {
            $user = $this->security->getUser();
            
            if (!$user instanceof User) {
                throw new \InvalidArgumentException('User must be authenticated');
            }
            
            $targetUser = $data->getTargetUser();
            if (!$targetUser) {
                throw new \InvalidArgumentException('Target user is required');
            }
            
            $action = $data->getAction();
            if (!$action) {
                throw new \InvalidArgumentException('Action is required');
            }
            
            // Vérifier si un match existe déjà
            $existingMatch = $this->entityManager->getRepository(UserMatch::class)
                ->findOneBy(['user' => $user, 'targetUser' => $targetUser]);
            
            if ($existingMatch) {
                // Détacher l'objet $data pour éviter le doublon
                if ($this->entityManager->contains($data)) {
                    $this->entityManager->detach($data);
                }
                $existingMatch->setAction($action);
                $this->entityManager->flush();
                return $existingMatch;
            }
            
            $data->setUser($user);
            $this->entityManager->persist($data);
            $this->entityManager->flush();
            
            return $data;
        }

        return $data;
    }
}
