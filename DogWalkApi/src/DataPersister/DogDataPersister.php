<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Dog;
use App\Entity\User;
use App\Service\KeywordService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

class DogDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly KeywordService $keywordService,
        private readonly RequestStack $requestStack
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Dog
    {
        if ($data instanceof Dog && $operation instanceof Post) {
            /** @var User|null $user */
            $user = $this->security->getUser();
            $data->setUser($user);
            
            // Si c'est le premier chien de l'utilisateur, marquer le profil comme complet
            if ($user instanceof User && !$user->isComplete()) {
                $user->setIsComplete(true);
            }
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

        return $data;
    }
}
