<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\GroupMembership;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class GroupMembershipDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): GroupMembership
    {
        if ($data instanceof GroupMembership && $operation instanceof Post) {
            /** @var User */
            $connectedUser = $this->security->getUser();
            
            if (!$connectedUser) {
                throw new \Symfony\Component\HttpKernel\Exception\HttpException(403, 'Seuls les utilisateurs connectés peuvent faire une demande de groupe');
            }

            // Par défaut, une nouvelle demande a le statut "requested"
            if (!$data->getStatus()) {
                $data->setStatus(GroupMembership::STATUS_REQUESTED);
            }

            // Par défaut, le rôle est MEMBER
            if (!$data->getRole()) {
                $data->setRole(GroupMembership::ROLE_MEMBER);
            }

            $this->entityManager->persist($data);
            $this->entityManager->flush();
        }

        return $data;
    }
}
