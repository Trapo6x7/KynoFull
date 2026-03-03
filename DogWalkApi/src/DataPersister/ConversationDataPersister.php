<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Conversation;
use App\Entity\Group;
use App\Entity\GroupMembership;
use App\Entity\User;
use App\Repository\ConversationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Crée ou retourne une conversation (privée ou de groupe).
 * POST { otherUserId: int }  → conversation privée entre deux utilisateurs
 * POST { groupId: int }      → conversation de groupe (membre actif requis)
 *
 * Idempotent dans les deux cas.
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

        if ($data->getGroupId()) {
            return $this->handleGroupConversation($data, $currentUser);
        }

        return $this->handlePrivateConversation($data, $currentUser);
    }

    private function handlePrivateConversation(Conversation $data, User $currentUser): Conversation
    {
        $otherId = $data->getOtherUserId();
        if (!$otherId) {
            throw new BadRequestHttpException('otherUserId ou groupId est requis.');
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
        $conversation->setType('private');
        $conversation->setParticipant1($currentUser);
        $conversation->setParticipant2($otherUser);

        $this->em->persist($conversation);
        $this->em->flush();

        return $conversation;
    }

    private function handleGroupConversation(Conversation $data, User $currentUser): Conversation
    {
        $groupId = $data->getGroupId();

        $group = $this->em->getRepository(Group::class)->find($groupId);
        if (!$group instanceof Group) {
            throw new NotFoundHttpException("Groupe #{$groupId} introuvable.");
        }

        // Vérifier que le demandeur est membre actif du groupe
        $membership = $this->em->getRepository(GroupMembership::class)->findOneBy([
            'user'      => $currentUser,
            'walkGroup' => $group,
            'status'    => GroupMembership::STATUS_ACTIVE,
        ]);

        if (!$membership) {
            throw new AccessDeniedHttpException('Vous devez être membre actif du groupe pour accéder à sa conversation.');
        }

        // Idempotent : une seule conversation par groupe
        $existing = $this->conversationRepository->findByGroup($group);
        if ($existing) {
            return $existing;
        }

        $conversation = new Conversation();
        $conversation->setType('group');
        $conversation->setGroup($group);

        $this->em->persist($conversation);
        $this->em->flush();

        return $conversation;
    }
}
