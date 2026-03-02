<?php

namespace App\Contract\Repository;

/**
 * Interface ségrégée du repository utilisateur.
 * Respecte ISP : ne déclare que les méthodes effectivement consommées par les services métier.
 * Respecte DIP : EmailVerificationService et UserController dépendent de cette abstraction,
 *               pas de la classe Doctrine concrète UserRepository.
 * Respecte OCP : on peut créer un InMemoryUserRepository pour les tests ou un
 *               CachedUserRepository sans modifier les consommateurs.
 */
interface UserRepositoryInterface
{
    /**
     * Trouve un utilisateur selon des critères.
     *
     * @param array      $criteria Tableau de critères (ex: ['email' => 'foo@bar.com'])
     * @param array|null $orderBy  Tri optionnel
     * @return object|null         En pratique toujours App\Entity\User|null
     */
    public function findOneBy(array $criteria, ?array $orderBy = null): ?object;

    /**
     * Retourne la liste des professions distinctes et non nulles.
     *
     * @return string[]
     */
    public function findDistinctProfessions(): array;
}
