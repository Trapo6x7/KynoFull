<?php

namespace App\EventListener;

use App\Entity\GroupMembership;
use App\Event\GroupCreatedEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

/**
 * Listener SRP : crée automatiquement le membership CREATOR quand un groupe est créé.
 *
 * Avant ce refactoring : GroupDataPersister créait lui-même l'objet GroupMembership,
 * mélangeant la responsabilité de persistance du groupe avec la logique métier
 * "le créateur d'un groupe est automatiquement membre avec le rôle CREATOR".
 *
 * Principe OCP : cette règle métier est maintenant ajoutée/modifiée indépendamment
 * du GroupCreateDataPersister.
 */
#[AsEventListener(event: GroupCreatedEvent::class)]
final class GroupCreatorMembershipListener
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {}

    public function __invoke(GroupCreatedEvent $event): void
    {
        $membership = new GroupMembership();
        $membership->setUser($event->getCreator());
        $membership->setRole(GroupMembership::ROLE_CREATOR);
        $membership->setStatus(GroupMembership::STATUS_ACTIVE);
        $membership->setWalkGroup($event->getGroup());

        $this->entityManager->persist($membership);
        $this->entityManager->flush();
    }
}
