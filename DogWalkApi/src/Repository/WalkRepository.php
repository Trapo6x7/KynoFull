<?php

namespace App\Repository;

use App\Contract\Repository\WalkRepositoryInterface;
use App\Entity\Walk;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Walk>
 */
class WalkRepository extends ServiceEntityRepository implements WalkRepositoryInterface
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Walk::class);
    }

    /**
     * Returns the average rating per OSM element ID across all users.
     * Only includes osmIds from the given list that actually have at least one rating.
     *
     * @param  int[] $osmIds
     * @return array<int, float>  [ osmId => avgRating ]
     */
    public function findAvgRatingsByOsmIds(array $osmIds): array
    {
        if (empty($osmIds)) {
            return [];
        }

        $rows = $this->createQueryBuilder('w')
            ->select('w.osmId AS osmId, AVG(w.rating) AS avg')
            ->where('w.osmId IN (:ids)')
            ->andWhere('w.rating IS NOT NULL')
            ->groupBy('w.osmId')
            ->setParameter('ids', $osmIds)
            ->getQuery()
            ->getArrayResult();

        $map = [];
        foreach ($rows as $row) {
            $map[(int) $row['osmId']] = round((float) $row['avg'], 1);
        }

        return $map;
    }

//    /**
//     * @return Walk[] Returns an array of Walk objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('w')
//            ->andWhere('w.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('w.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Walk
//    {
//        return $this->createQueryBuilder('w')
//            ->andWhere('w.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
