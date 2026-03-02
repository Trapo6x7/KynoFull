<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class MeProvider implements ProviderInterface
{
    public function __construct(
        private Security $security,
        private EntityManagerInterface $entityManager // Ajout de l'EntityManager
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): User
    {
        $user = $this->security->getUser();

        // getUser() peut retourner null ou UserInterface → on lève une exception explicite
        // au lieu d'un TypeError aléatoire à runtime (SOLID - LSP)
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentification requise.');
        }

        return $user;
    }
}
