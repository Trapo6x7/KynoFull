<?php

namespace App\Event;

use App\Entity\User;

/**
 * Événement dispatché après qu'un nouvel utilisateur s'est inscrit.
 *
 * Symétrie avec DogCreatedEvent : découple les side-effects de l'inscription
 * (envoi d'email de vérification, analytics, webhooks…) du DataPersister.
 *
 * Principe OCP : ajouter un nouveau comportement post-inscription = créer un nouveau
 * listener, sans toucher à UserDataPersister.
 */
final class UserRegisteredEvent
{
    public function __construct(
        private readonly User $user
    ) {}

    public function getUser(): User
    {
        return $this->user;
    }
}
