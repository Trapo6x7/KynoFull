<?php

namespace App\Contract\Repository;

/**
 * Interface ségrégée du repository Walk.
 * Respecte ISP : ne déclare que les méthodes consommées par WalkController.
 * Respecte DIP : WalkController dépend de cette abstraction, pas de la classe Doctrine concrète.
 */
interface WalkRepositoryInterface
{
    /**
     * Trouve des promenades selon des critères.
     *
     * @param array      $criteria Tableau de critères (ex: ['walkGroup' => $id])
     * @param array|null $orderBy  Tri optionnel
     * @param int|null   $limit    Limite optionnelle
     * @param int|null   $offset   Offset optionnel
     *
     * @return array<int, object>
     */
    public function findBy(array $criteria, ?array $orderBy = null, ?int $limit = null, ?int $offset = null): array;
}
