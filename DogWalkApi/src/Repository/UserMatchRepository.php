<?php

namespace App\Repository;

use App\Entity\UserMatch;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class UserMatchRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserMatch::class);
    }

    public function findMatchBetweenUsers(User $user, User $targetUser): ?UserMatch
    {
        return $this->findOneBy([
            'user' => $user,
            'targetUser' => $targetUser,
        ]);
    }

    public function findMutualLikes(User $user): array
    {
        return $this->createQueryBuilder('um')
            ->innerJoin(UserMatch::class, 'um2', 'WITH', 'um2.user = um.targetUser AND um2.targetUser = um.user')
            ->where('um.user = :user')
            ->andWhere('um.action = :like')
            ->andWhere('um2.action = :like')
            ->setParameter('user', $user)
            ->setParameter('like', UserMatch::ACTION_LIKE)
            ->getQuery()
            ->getResult();
    }

    public function getUsersAlreadySeen(User $user): array
    {
        $results = $this->createQueryBuilder('um')
            ->select('IDENTITY(um.targetUser) as seenId')
            ->where('um.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getScalarResult();

        return array_column($results, 'seenId');
    }

    /**
     * Retourne tous les UserMatch où l'utilisateur est émetteur OU receveur.
     * Utilisé par UserMatchCollectionProvider pour isoler les données par user.
     */
    public function findAllInvolvingUser(User $user): array
    {
        return $this->createQueryBuilder('um')
            ->where('um.user = :user OR um.targetUser = :user')
            ->setParameter('user', $user)
            ->orderBy('um.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
