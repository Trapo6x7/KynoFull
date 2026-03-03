<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Conversation;
use App\Entity\GroupMembership;
use App\Entity\Message;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Enregistre un message, met à jour les dénormalisations de la conversation.
 * Supporte les conversations privées ET de groupe.
 */
class MessageDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Message
    {
        if (!$data instanceof Message) {
            return $data;
        }

        $sender = $this->security->getUser();
        if (!$sender instanceof User) {
            throw new \RuntimeException('Utilisateur non authentifié.');
        }

        $conversation = $data->getConversation();
        if (!$conversation instanceof Conversation) {
            throw new BadRequestHttpException('Le champ conversation est requis.');
        }

        // ── Vérification d'accès selon le type ────────────────────────────
        if ($conversation->isGroupConversation()) {
            $this->assertGroupMember($sender, $conversation);
        } else {
            $this->assertPrivateParticipant($sender, $conversation);
        }

        $content = $data->getContent();
        if (!$content || trim($content) === '') {
            throw new BadRequestHttpException('Le message ne peut pas être vide.');
        }

        $data->setSender($sender);

        // ── Dénormalisation ────────────────────────────────────────────────
        $conversation->setLastMessageContent($content);
        $conversation->setLastMessageAt(new \DateTimeImmutable());

        // Pour les conversations privées : incrémenter le compteur du destinataire
        if (!$conversation->isGroupConversation()) {
            $p1 = $conversation->getParticipant1();
            $p2 = $conversation->getParticipant2();
            $recipient = ($p1?->getId() === $sender->getId()) ? $p2 : $p1;
            if ($recipient) {
                $conversation->incrementUnreadFor($recipient);
            }
        }

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }

    private function assertPrivateParticipant(User $sender, Conversation $conversation): void
    {
        if (!$conversation->hasParticipant($sender)) {
            throw new AccessDeniedHttpException('Vous ne participez pas à cette conversation.');
        }
    }

    private function assertGroupMember(User $sender, Conversation $conversation): void
    {
        $group = $conversation->getGroup();
        if (!$group) {
            throw new \LogicException('Conversation de groupe sans groupe associé.');
        }

        $membership = $this->em->getRepository(GroupMembership::class)->findOneBy([
            'user'      => $sender,
            'walkGroup' => $group,
            'status'    => GroupMembership::STATUS_ACTIVE,
        ]);

        if (!$membership) {
            throw new AccessDeniedHttpException('Vous devez être membre actif du groupe pour envoyer des messages.');
        }
    }
}
