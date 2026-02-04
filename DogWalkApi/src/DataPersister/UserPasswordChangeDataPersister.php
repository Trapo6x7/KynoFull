<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\UserPasswordUpdateDto;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserPasswordChangeDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private Security $security,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {

        if (!$data instanceof UserPasswordUpdateDto) {
            throw new \InvalidArgumentException('Unexpected data type.');
        }
    
        /** @var User $user */
        $user = $this->security->getUser();
    
        if (!$this->passwordHasher->isPasswordValid($user, $data->oldPassword)) {
            throw new BadRequestHttpException('Ancien mot de passe incorrect.');
        }
    
        $hashedPassword = $this->passwordHasher->hashPassword($user, $data->password);
        $user->setPassword($hashedPassword);
        $user->setUpdatedAt(new \DateTimeImmutable());
    
        $this->entityManager->persist($user);
        $this->entityManager->flush();
    
        return $user;
    }
}
