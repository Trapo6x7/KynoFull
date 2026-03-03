<?php

namespace App\Repository;

use App\Entity\Conversation;
use App\Entity\Group;
use App\Entity\GroupMembership;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class ConversationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Conversation::class);
    }

    /** Conversations privées où $user est participant, triées par dernier message */
    public function findByParticipant(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.participant1 = :user OR c.participant2 = :user')
            ->andWhere('c.type = :type')
            ->setParameter('user', $user)
            ->setParameter('type', 'private')
            ->orderBy('c.lastMessageAt', 'DESC')
            ->addOrderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Conversations de groupe pour les groupes dont $user est membre actif.
     * Utilise un sous-requête DQL sur GroupMembership.
     */
    public function findGroupConversationsByMember(User $user): array
    {
        return $this->createQueryBuilder('c')
            ->join(GroupMembership::class, 'gm', 'WITH', 'gm.walkGroup = c.group')
            ->where('gm.user = :user')
            ->andWhere('gm.status = :status')
            ->andWhere('c.type = :type')
            ->setParameter('user', $user)
            ->setParameter('status', GroupMembership::STATUS_ACTIVE)
            ->setParameter('type', 'group')
            ->orderBy('c.lastMessageAt', 'DESC')
            ->addOrderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /** Toutes les conversations (privées + groupe) d'un utilisateur */
    public function findAllForUser(User $user): array
    {
        $private = $this->findByParticipant($user);
        $group   = $this->findGroupConversationsByMember($user);

        // Fusion et tri par lastMessageAt DESC
        $all = array_merge($private, $group);
        usort($all, static function (Conversation $a, Conversation $b): int {
            $ta = $a->getLastMessageAt()?->getTimestamp() ?? $a->getCreatedAt()?->getTimestamp() ?? 0;
            $tb = $b->getLastMessageAt()?->getTimestamp() ?? $b->getCreatedAt()?->getTimestamp() ?? 0;
            return $tb <=> $ta;
        });

        return $all;
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

    /** Trouve la conversation liée à un groupe (une seule par groupe) */
    public function findByGroup(Group $group): ?Conversation
    {
        return $this->findOneBy(['group' => $group, 'type' => 'group']);
    }
}
