<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Dog;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpFoundation\RequestStack;

class DogImageDataPersister implements ProcessorInterface
{
    private EntityManagerInterface $entityManager;
    private RequestStack $requestStack;
    private string $uploadsDir;

    public function __construct(
        EntityManagerInterface $entityManager,
        RequestStack $requestStack,
        string $uploadsDir
    ) {
        $this->entityManager = $entityManager;
        $this->requestStack = $requestStack;
        $this->uploadsDir = $uploadsDir;
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        $request = $this->requestStack->getCurrentRequest();

        $uploadedFile = $request->files->get('file');

        if (!$uploadedFile instanceof UploadedFile) {
            throw new BadRequestHttpException('Aucun fichier envoyé.');
        }

        $dogId = $uriVariables['id'] ?? null;
        if (!$dogId) {
            throw new BadRequestHttpException('ID du chien manquant.');
        }

        $dog = $this->entityManager->getRepository(Dog::class)->find($dogId);
        if (!$dog) {
            throw new BadRequestHttpException('Chien non trouvé.');
        }

        $filename = uniqid().'.'.$uploadedFile->guessExtension();
        $uploadedFile->move($this->uploadsDir, $filename);

        $dog->setImageFilename($filename);
        $this->entityManager->flush();

        return $dog;
    }
}
