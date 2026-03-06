<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Conversation;
use App\Entity\User;
use App\Repository\ConversationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Crée ou retourne une conversation privée entre deux utilisateurs.
 * POST { otherUserId: int } → conversation 1-à-1
 * Idempotent.
 */
class ConversationDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
        private readonly ConversationRepository $conversationRepository,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Conversation
    {
        if (!$data instanceof Conversation) {
            return $data;
        }

        $currentUser = $this->security->getUser();
        if (!$currentUser instanceof User) {
            throw new \RuntimeException('Utilisateur non authentifié.');
        }

        $otherId = $data->getOtherUserId();
        if (!$otherId) {
            throw new BadRequestHttpException('otherUserId est requis.');
        }

        $otherUser = $this->em->getRepository(User::class)->find($otherId);
        if (!$otherUser instanceof User) {
            throw new NotFoundHttpException("Utilisateur #{$otherId} introuvable.");
        }

        $existing = $this->conversationRepository->findBetween($currentUser, $otherUser);
        if ($existing) {
            return $existing;
        }

        $conversation = new Conversation();
        $conversation->setParticipant1($currentUser);
        $conversation->setParticipant2($otherUser);

        $this->em->persist($conversation);
        $this->em->flush();

        return $conversation;
    }
}
