<?php

namespace App\Contract\Repository;

use App\Entity\Dog;

/**
 * Interface ségrégée du repository Dog.
 * Respecte ISP : ne déclare que la méthode consommée par DogController.
 * Respecte DIP : DogController dépend de cette abstraction, pas de DogRepository (Doctrine).
 *
 * Note : find() ne déclare que $id car c'est la seule utilisation dans DogController.
 * L'implémentation Doctrine peut accepter plus de paramètres (lock mode, version).
 */
interface DogRepositoryInterface
{
    /**
     * Trouve un chien par son identifiant.
     */
    public function find(mixed $id): ?object;
}
