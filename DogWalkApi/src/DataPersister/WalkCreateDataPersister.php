<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Walk;
use App\Service\GroupMembershipChecker;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * State processor SRP : gère uniquement la création d'une Walk (POST).
 *
 * Responsabilité unique : valider que l'utilisateur est membre actif du groupe
 * associé à la promenade, puis persister l'entité.
 *
 * La vérification métier est déléguée à GroupMembershipChecker pour éviter
 * la duplication de cette règle avec WalkVoter (DRY / SRP).
 *
 * Remplace l'ancien WalkDataPersister qui gérait création + mise à jour dans
 * une seule classe (violation SRP).
 */
final class WalkCreateDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly GroupMembershipChecker $membershipChecker
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

        $group = $data->getWalkGroup();

        if (!$group) {
            throw new BadRequestHttpException("Le groupe à associer à la promenade est manquant.");
        }

        if (!$this->membershipChecker->isMemberOf($user, $group)) {
            throw new AccessDeniedException("L'utilisateur n'est pas membre du groupe sélectionné.");
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
