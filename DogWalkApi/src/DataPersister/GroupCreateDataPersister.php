<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Contract\KeywordSynchronizerInterface;
use App\Entity\Group;
use App\Entity\User;
use App\Event\GroupCreatedEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * State processor SRP : gère uniquement la création d'un Group (POST).
 *
 * Responsabilités :
 *   1. Associer le créateur au groupe
 *   2. Persister le groupe
 *   3. Synchroniser les keywords
 *   4. Dispatcher GroupCreatedEvent (le membership est créé par GroupCreatorMembershipListener)
 *
 * Remplace GroupDataPersister qui cumulait la persistance du groupe ET la création
 * du membership du créateur (violation SRP).
 *
 * Renommé de GroupDataPersister → GroupCreateDataPersister pour indiquer sa portée (OCP/SRP).
 */
final class GroupCreateDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly KeywordSynchronizerInterface $keywordService,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Group
    {
        if (!$data instanceof Group) {
            return $data;
        }

        /** @var User $creator */
        $creator = $this->security->getUser();
        $data->setCreator($creator);

        // Récupère les keywords avant persist (pour les nouveaux objets sans ID)
        $keywords = $data->getKeywords();

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

        // Dispatch de l'événement post-création (OCP : le membership est créé par un listener)
        $this->eventDispatcher->dispatch(new GroupCreatedEvent($data, $creator));

        return $data;
    }
}
