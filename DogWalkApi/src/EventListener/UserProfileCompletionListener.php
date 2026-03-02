<?php

namespace App\EventListener;

use App\Event\DogCreatedEvent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

/**
 * Responsabilité unique : marquer le profil utilisateur comme complet
 * lorsqu'il crée son premier chien.
 *
 * Cette logique était auparavant dans DogDataPersister, ce qui violait SRP
 * (un persister de chien ne devrait pas modifier l'état d'un utilisateur).
 * Ce listener réagit à l'événement DogCreatedEvent → respecte OCP :
 * ajouter ce comportement n'a pas nécessité de modifier DogDataPersister.
 */
#[AsEventListener(event: DogCreatedEvent::class)]
class UserProfileCompletionListener
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    public function __invoke(DogCreatedEvent $event): void
    {
        $user = $event->getOwner();

        if (!$user->isComplete()) {
            $user->setIsComplete(true);
            $this->em->flush();
        }
    }
}
