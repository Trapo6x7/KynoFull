<?php

namespace App\Event;

use App\Entity\Group;
use App\Entity\User;

/**
 * Événement dispatché après la création d'un nouveau groupe.
 *
 * Symétrie avec DogCreatedEvent et UserRegisteredEvent.
 * Permet de découpler les side-effects de la création (membership du créateur,
 * notifications, etc.) du GroupCreateDataPersister.
 *
 * Principe OCP : ajouter un comportement post-création = nouveau listener.
 */
final class GroupCreatedEvent
{
    public function __construct(
        private readonly Group $group,
        private readonly User $creator
    ) {}

    public function getGroup(): Group
    {
        return $this->group;
    }

    public function getCreator(): User
    {
        return $this->creator;
    }
}
