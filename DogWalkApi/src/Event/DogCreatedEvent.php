<?php

namespace App\Event;

use App\Entity\Dog;
use App\Entity\User;

/**
 * Événement dispatché après la création d'un chien.
 * Permet de découpler les effets de bord (ex: complétion du profil utilisateur)
 * du DogDataPersister (SOLID - SRP, OCP).
 */
class DogCreatedEvent
{
    public function __construct(
        private readonly Dog $dog,
        private readonly User $owner
    ) {}

    public function getDog(): Dog
    {
        return $this->dog;
    }

    public function getOwner(): User
    {
        return $this->owner;
    }
}
