<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Dog;
use App\Entity\User;
use App\Event\DogCreatedEvent;
use App\Contract\KeywordSynchronizerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class DogDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly KeywordSynchronizerInterface $keywordService,
        private readonly RequestStack $requestStack,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Dog
    {
        if ($data instanceof Dog && $operation instanceof Post) {
            /** @var User|null $user */
            $user = $this->security->getUser();
            $data->setUser($user);
            // La complétion du profil utilisateur est gérée par UserProfileCompletionListener
            // via l'événement DogCreatedEvent (SRP : ce persister ne concerne que le chien)
        }

        // Récupère les keywords depuis la requête HTTP (stockés par le listener)
        $request = $this->requestStack->getCurrentRequest();
        $keywords = $request?->attributes->get('_keywords') ?? $data->getKeywords();

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        // Synchronise les keywords après avoir l'ID
        if ($keywords !== null && is_array($keywords) && count($keywords) > 0) {
            $this->keywordService->syncKeywords(
                Dog::getKeywordableType(),
                $data->getId(),
                $keywords
            );
            $this->entityManager->flush();
        }

        // Dispatcher l'événement pour notifier les listeners (ex: UserProfileCompletionListener)
        if ($operation instanceof Post && $data->getUser() instanceof User) {
            $this->eventDispatcher->dispatch(new DogCreatedEvent($data, $data->getUser()));
        }

        return $data;
    }
}
