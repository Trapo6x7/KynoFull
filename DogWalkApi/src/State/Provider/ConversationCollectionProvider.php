<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\User;
use App\Repository\ConversationRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * Retourne uniquement les conversations de l'utilisateur connecté.
 * SRP : responsabilité unique = filtrer par participant courant.
 */
class ConversationCollectionProvider implements ProviderInterface
{
    public function __construct(
        private readonly Security $security,
        private readonly ConversationRepository $conversationRepository,
    ) {}

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentification requise.');
        }

        return $this->conversationRepository->findAllForUser($user);
    }
}
