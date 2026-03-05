<?php

namespace App\Controller;

use App\Entity\Conversation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Attribute\Route;

class ConversationReadController extends AbstractController
{
    public function __construct(private readonly EntityManagerInterface $em) {}

    #[Route(
        '/api/conversations/{id}/read',
        name: 'conversation_mark_read',
        methods: ['POST'],
    )]
    public function __invoke(Conversation $conversation): JsonResponse
    {
        $user = $this->getUser();

        if (!$conversation->hasParticipant($user)) {
            throw new AccessDeniedHttpException('Vous ne participez pas à cette conversation.');
        }

        $conversation->resetUnreadFor($user);
        $this->em->flush();

        return $this->json(['unread' => 0]);
    }
}
