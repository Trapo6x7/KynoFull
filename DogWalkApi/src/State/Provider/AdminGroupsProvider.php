<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Group;
use App\Entity\GroupMembership;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class AdminGroupsProvider implements ProviderInterface
{
    public function __construct(
        private Security $security,
        private EntityManagerInterface $entityManager
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $user = $this->security->getUser();

        if (!$user || !is_object($user)) {
            return [];
        }
        
        return $this->entityManager->getRepository(GroupMembership::class)
        ->createQueryBuilder('gm')
        ->innerJoin('gm.walkGroup', 'g')
        ->where('gm.user = :user')
        ->andWhere('gm.role = :role')
        ->andWhere('gm.status = :status')
        ->setParameter('user', $user)
        ->setParameter('role', GroupMembership::ROLE_ADMIN)
        ->setParameter('status', GroupMembership::STATUS_ACTIVE)
        ->getQuery()
        ->getResult();
    }
}
