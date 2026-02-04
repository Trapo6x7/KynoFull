<?php

namespace App\Repository;

use App\Entity\GroupMembership;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<GroupMembership>
 */
class GroupMembershipRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, GroupMembership::class);
    }

    /**
     * Trouve tous les membres actifs d'un groupe
     * 
     * @return GroupMembership[]
     */
    public function findActiveMembers(int $groupId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.walkGroup = :groupId')
            ->andWhere('m.status = :status')
            ->setParameter('groupId', $groupId)
            ->setParameter('status', GroupMembership::STATUS_ACTIVE)
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les demandes en attente d'un groupe
     * 
     * @return GroupMembership[]
     */
    public function findPendingRequests(int $groupId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.walkGroup = :groupId')
            ->andWhere('m.status = :status')
            ->setParameter('groupId', $groupId)
            ->setParameter('status', GroupMembership::STATUS_REQUESTED)
            ->orderBy('m.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve toutes les invitations d'un utilisateur
     * 
     * @return GroupMembership[]
     */
    public function findUserInvitations(int $userId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.user = :userId')
            ->andWhere('m.status = :status')
            ->setParameter('userId', $userId)
            ->setParameter('status', GroupMembership::STATUS_INVITED)
            ->orderBy('m.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve l'appartenance d'un utilisateur à un groupe
     */
    public function findMembership(int $userId, int $groupId): ?GroupMembership
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.user = :userId')
            ->andWhere('m.walkGroup = :groupId')
            ->setParameter('userId', $userId)
            ->setParameter('groupId', $groupId)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Compte les membres actifs d'un groupe
     */
    public function countActiveMembers(int $groupId): int
    {
        return $this->createQueryBuilder('m')
            ->select('COUNT(m.id)')
            ->andWhere('m.walkGroup = :groupId')
            ->andWhere('m.status = :status')
            ->setParameter('groupId', $groupId)
            ->setParameter('status', GroupMembership::STATUS_ACTIVE)
            ->getQuery()
            ->getSingleScalarResult();
    }

    /**
     * Trouve les admins d'un groupe
     * 
     * @return GroupMembership[]
     */
    public function findGroupAdmins(int $groupId): array
    {
        return $this->createQueryBuilder('m')
            ->andWhere('m.walkGroup = :groupId')
            ->andWhere('m.status = :status')
            ->andWhere('m.role IN (:roles)')
            ->setParameter('groupId', $groupId)
            ->setParameter('status', GroupMembership::STATUS_ACTIVE)
            ->setParameter('roles', [GroupMembership::ROLE_ADMIN, GroupMembership::ROLE_CREATOR])
            ->getQuery()
            ->getResult();
    }
}
