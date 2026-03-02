<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Contract\FileUploaderInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * State processor SRP : gère uniquement l'upload d'image pour un User.
 *
 * Avant ce refactoring : la logique d'upload était une branche `if (image_post)` dans
 * UserDataPersister ET dans UserUpdateDataPersister, dupliquant 15 lignes identiques
 * et violant SRP (chaque persister gérait 2 responsabilités hétérogènes).
 *
 * Maintenant UserDataPersister = inscription, UserUpdateDataPersister = mise à jour profil,
 * UserImageUploadDataPersister = upload image. Chacun a une responsabilité unique.
 */
final class UserImageUploadDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly FileUploaderInterface $fileUploader,
        private readonly RequestStack $requestStack,
        private readonly Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        /** @var User|null $user */
        $user = $this->security->getUser();

        if (!$user instanceof User) {
            throw new AccessDeniedException("Authentification requise pour uploader une image.");
        }

        $request = $this->requestStack->getCurrentRequest();

        if ($request && $request->files->has('file')) {
            $file = $request->files->get('file');

            if ($file) {
                $fileName = $this->fileUploader->upload($file);
                $images = $user->getImages() ?? [];
                $images[] = $fileName;
                $user->setImages($images);
                $user->setUpdatedAt(new \DateTimeImmutable());
                $this->entityManager->flush();
            }
        }

        return $user;
    }
}
