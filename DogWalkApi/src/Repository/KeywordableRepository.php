<?php

namespace App\Repository;

use App\Entity\Keywordable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Keywordable>
 */
class KeywordableRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Keywordable::class);
    }

    /**
     * Trouve tous les keywords pour une entité donnée
     * 
     * @return Keywordable[]
     */
    public function findByKeywordable(string $type, int $id): array
    {
        return $this->createQueryBuilder('k')
            ->andWhere('k.keywordableType = :type')
            ->andWhere('k.keywordableId = :id')
            ->setParameter('type', $type)
            ->setParameter('id', $id)
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les entités d'un type donné qui ont un keyword spécifique
     * 
     * @return int[] IDs des entités
     */
    public function findIdsByKeyword(string $type, int $keywordId): array
    {
        $result = $this->createQueryBuilder('k')
            ->select('k.keywordableId')
            ->andWhere('k.keywordableType = :type')
            ->andWhere('k.keyword = :keywordId')
            ->setParameter('type', $type)
            ->setParameter('keywordId', $keywordId)
            ->getQuery()
            ->getArrayResult();

        return array_column($result, 'keywordableId');
    }

    /**
     * Supprime toutes les associations keywords pour une entité
     */
    public function removeAllForKeywordable(string $type, int $id): void
    {
        $this->createQueryBuilder('k')
            ->delete()
            ->andWhere('k.keywordableType = :type')
            ->andWhere('k.keywordableId = :id')
            ->setParameter('type', $type)
            ->setParameter('id', $id)
            ->getQuery()
            ->execute();
    }
}
