<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Walk;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

final class WalkCreateDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Walk
    {
        if (!$data instanceof Walk) {
            return $data;
        }

        $user = $this->security->getUser();

        if (!$user) {
            throw new AccessDeniedException("L'utilisateur n'est pas connecté.");
        }

        // Associer l'utilisateur au spot
        $data->setUser($user);

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
