<?php

namespace App\Repository;

use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ConversationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conversation::class);
    }

    /** Toutes les conversations privées d'un utilisateur, triées par dernier message */
    public function findAllForUser(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.participant1 = :user OR c.participant2 = :user')
            ->setParameter('user', $user)
            ->orderBy('c.lastMessageAt', 'DESC')
            ->addOrderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Trouve une conversation privée existante entre deux utilisateurs */
    public function findBetween(User $user1, User $user2): ?Conversation
    {
        return $this->createQueryBuilder('c')
            ->where(
                '(c.participant1 = :u1 AND c.participant2 = :u2) OR (c.participant1 = :u2 AND c.participant2 = :u1)'
            )
            ->setParameter('u1', $user1)
            ->setParameter('u2', $user2)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }


}
