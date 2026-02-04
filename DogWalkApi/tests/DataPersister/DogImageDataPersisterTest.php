<?php

namespace App\Tests\DataPersister;

use App\DataPersister\DogImageDataPersister;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use ApiPlatform\Metadata\Operation;

class DogImageDataPersisterTest extends TestCase
{
    public function testProcessThrowsExceptionIfNoFile()
    {
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $requestStack = new RequestStack();
        $request = new Request([], [], [], [], []); // Pas de fichier
        $requestStack->push($request);

        $persister = new DogImageDataPersister($entityManager, $requestStack, '/tmp');

        $this->expectException(BadRequestHttpException::class);
        $this->expectExceptionMessage('Aucun fichier envoyé.');

        $persister->process(null, $this->createMock(Operation::class));
    }
}
