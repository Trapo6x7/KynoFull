<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Repository\UserMatchRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Retourne uniquement les UserMatch impliquant l'utilisateur connecté
 * (en tant qu'émetteur OU receveur).
 * Empêche la fuite des données de swipe des autres utilisateurs.
 */
class UserMatchCollectionProvider implements ProviderInterface
{
    public function __construct(
        private readonly Security $security,
        private readonly UserMatchRepository $userMatchRepository,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentification requise.');
        }

        return $this->userMatchRepository->findAllInvolvingUser($user);
    }
}
