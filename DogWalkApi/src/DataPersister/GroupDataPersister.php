<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Get;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Dog;
use App\Entity\Group;
use App\Entity\GroupMembership;
use App\Entity\User;
use App\Service\KeywordService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RedirectResponse;

class GroupDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly KeywordService $keywordService
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Group
    {
        // Récupère les keywords avant persist (pour les nouveaux objets sans ID)
        $keywords = $data->getKeywords();

        if ($data instanceof Group && $operation instanceof Post) {
            /** @var User $creator */
            $creator = $this->security->getUser();
            // Lier le créateur au groupe
            $data->setCreator($creator);

            // Créer l'appartenance du créateur (remplace GroupRole)
            $membership = new GroupMembership();
            $membership->setUser($creator);
            $membership->setRole(GroupMembership::ROLE_CREATOR);
            $membership->setStatus(GroupMembership::STATUS_ACTIVE);
            $membership->setWalkGroup($data);

            $this->entityManager->persist($membership);
            $this->entityManager->persist($data);
            $this->entityManager->flush();

            // Synchronise les keywords après avoir l'ID
            if ($keywords !== null) {
                $this->keywordService->syncKeywords(
                    Group::getKeywordableType(),
                    $data->getId(),
                    $keywords
                );
                $this->entityManager->flush();
            }
        }

        return $data;
    }
}