<?php
// Ce fichier est a créer dans src/DataPersister
namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Contract\KeywordSynchronizerInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class UserUpdateDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly RequestStack $requestStack,
        private readonly KeywordSynchronizerInterface $keywordService
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if ($data instanceof User) {
            // Récupère les keywords depuis la requête HTTP (stockés par le listener)
            $request = $this->requestStack->getCurrentRequest();
            $keywords = $request?->attributes->get('_keywords') ?? $data->getKeywords();

            // Les données sont déjà dans $data grâce à la désérialisation API Platform
            // Mettre à jour la date de modification
            $data->setUpdatedAt(new \DateTimeImmutable());
            
            $this->entityManager->persist($data);
            $this->entityManager->flush();

            // Synchronise les keywords
            if ($keywords !== null && is_array($keywords) && count($keywords) > 0) {
                $this->keywordService->syncKeywords(
                    User::getKeywordableType(),
                    $data->getId(),
                    $keywords
                );
                $this->entityManager->flush();
            }
        }

        return $data;
    }
}
