<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Dog;
use App\Service\KeywordService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class DogDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly KeywordService $keywordService
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Dog
    {
        if ($data instanceof Dog && $operation instanceof Post) {
            $data->setUser($this->security->getUser());
        }

        // Récupère les keywords avant persist (pour les nouveaux objets sans ID)
        $keywords = $data->getKeywords();

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        // Synchronise les keywords après avoir l'ID
        if ($keywords !== null) {
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
