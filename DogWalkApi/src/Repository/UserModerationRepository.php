<?php

namespace App\Repository;

use App\Entity\UserModeration;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserModeration>
 */
class UserModerationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserModeration::class);
    }

    /**
     * Trouve tous les blocages d'un utilisateur
     * 
     * @return UserModeration[]
     */
    public function findBlocksByUser(int $userId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.user = :userId')
            ->andWhere('m.actionType = :actionType')
            ->setParameter('userId', $userId)
            ->setParameter('actionType', UserModeration::ACTION_BLOCK)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les signalements en attente
     * 
     * @return UserModeration[]
     */
    public function findPendingReports(): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.actionType = :actionType')
            ->andWhere('m.status = :status')
            ->setParameter('actionType', UserModeration::ACTION_REPORT)
            ->setParameter('status', UserModeration::STATUS_PENDING)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve tous les signalements d'une cible spécifique
     * 
     * @return UserModeration[]
     */
    public function findReportsByTarget(string $targetType, int $targetId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.actionType = :actionType')
            ->andWhere('m.targetType = :targetType')
            ->andWhere('m.targetId = :targetId')
            ->setParameter('actionType', UserModeration::ACTION_REPORT)
            ->setParameter('targetType', $targetType)
            ->setParameter('targetId', $targetId)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Vérifie si un utilisateur a déjà bloqué une cible
     */
    public function hasBlocked(int $userId, string $targetType, int $targetId): bool
    {
        $result = $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->andWhere('m.user = :userId')
            ->andWhere('m.actionType = :actionType')
            ->andWhere('m.targetType = :targetType')
            ->andWhere('m.targetId = :targetId')
            ->setParameter('userId', $userId)
            ->setParameter('actionType', UserModeration::ACTION_BLOCK)
            ->setParameter('targetType', $targetType)
            ->setParameter('targetId', $targetId)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Vérifie si un utilisateur a déjà signalé une cible
     */
    public function hasReported(int $userId, string $targetType, int $targetId): bool
    {
        $result = $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->andWhere('m.user = :userId')
            ->andWhere('m.actionType = :actionType')
            ->andWhere('m.targetType = :targetType')
            ->andWhere('m.targetId = :targetId')
            ->setParameter('userId', $userId)
            ->setParameter('actionType', UserModeration::ACTION_REPORT)
            ->setParameter('targetType', $targetType)
            ->setParameter('targetId', $targetId)
            ->getQuery()
            ->getSingleScalarResult();

        return $result > 0;
    }

    /**
     * Compte le nombre de signalements pour une cible
     */
    public function countReportsByTarget(string $targetType, int $targetId): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->andWhere('m.actionType = :actionType')
            ->andWhere('m.targetType = :targetType')
            ->andWhere('m.targetId = :targetId')
            ->andWhere('m.status = :status')
            ->setParameter('actionType', UserModeration::ACTION_REPORT)
            ->setParameter('targetType', $targetType)
            ->setParameter('targetId', $targetId)
            ->setParameter('status', UserModeration::STATUS_PENDING)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Trouve tous les utilisateurs bloqués par un utilisateur
     * 
     * @return int[] IDs des utilisateurs bloqués
     */
    public function findBlockedUserIds(int $userId): array
    {
        $result = $this->createQueryBuilder('m')
            ->select('m.targetId')
            ->andWhere('m.user = :userId')
            ->andWhere('m.actionType = :actionType')
            ->andWhere('m.targetType = :targetType')
            ->setParameter('userId', $userId)
            ->setParameter('actionType', UserModeration::ACTION_BLOCK)
            ->setParameter('targetType', UserModeration::TARGET_USER)
            ->getQuery()
            ->getArrayResult();

        return array_column($result, 'targetId');
    }
}
