<?php
// Ce fichier est a créer dans src/DataPersister
namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Contract\KeywordSynchronizerInterface;
use App\Event\UserRegisteredEvent;
use App\Service\VerificationCodeGenerator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class UserDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly RequestStack $requestStack,
        private readonly KeywordSynchronizerInterface $keywordService,
        private readonly VerificationCodeGenerator $codeGenerator,
        private readonly EventDispatcherInterface $eventDispatcher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if ($data instanceof User) {
            // Récupère les keywords depuis la requête HTTP (stockés par le listener)
            $request = $this->requestStack->getCurrentRequest();
            $keywords = $request?->attributes->get('_keywords') ?? $data->getKeywords();

            if ($data->getPassword()) {
                // Vérifier si le mot de passe est déjà haché
                if (!$this->passwordHasher->isPasswordValid($data, $data->getPassword())) {
                    $hashedPassword = $this->passwordHasher->hashPassword($data, $data->getPassword());
                    $data->setPassword($hashedPassword);
                }
            }

            // Générer un code de vérification à 6 chiffres (délégué au service dédié)
            $isNewUser = !$data->getId(); // Seulement lors de l'inscription
            if ($isNewUser) {
                $data->setVerificationCode($this->codeGenerator->generate());
                $data->setVerificationCodeExpiresAt(new \DateTimeImmutable('+24 hours'));
            }
        
            $this->entityManager->persist($data);
            $this->entityManager->flush();

            // Dispatch de l'événement post-inscription (OCP : les side-effects sont dans des listeners)
            if ($isNewUser) {
                $this->eventDispatcher->dispatch(new UserRegisteredEvent($data));
            }

            // Synchronise les keywords après avoir l'ID
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
