<?php

namespace App\Controller\Admin;

use App\Repository\UserRepository;
use App\Repository\DogRepository;
use App\Repository\UserMatchRepository;
use App\Repository\ConversationRepository;
use App\Repository\KeywordRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/admin')]
class DashboardController extends AbstractController
{
    #[Route('', name: 'admin')]
    public function index(
        UserRepository $userRepo,
        DogRepository $dogRepo,
        UserMatchRepository $matchRepo,
        ConversationRepository $convRepo
    ): Response {
        return $this->render('admin/dashboard.html.twig', [
            'userCount' => $userRepo->count([]),
            'dogCount' => $dogRepo->count([]),
            'matchCount' => $matchRepo->count([]),
            'convCount' => $convRepo->count([]),
        ]);
    }

    #[Route('/users', name: 'admin_users')]
    public function users(UserRepository $userRepo): Response
    {
        return $this->render('admin/users.html.twig', [
            'users' => $userRepo->findAll(),
        ]);
    }

    #[Route('/dogs', name: 'admin_dogs')]
    public function dogs(DogRepository $dogRepo): Response
    {
        return $this->render('admin/dogs.html.twig', [
            'dogs' => $dogRepo->findAll(),
        ]);
    }

    #[Route('/matches', name: 'admin_matches')]
    public function matches(UserMatchRepository $matchRepo): Response
    {
        return $this->render('admin/matches.html.twig', [
            'matches' => $matchRepo->findAll(),
        ]);
    }

    #[Route('/conversations', name: 'admin_conversations')]
    public function conversations(ConversationRepository $convRepo): Response
    {
        return $this->render('admin/conversations.html.twig', [
            'conversations' => $convRepo->findAll(),
        ]);
    }

    #[Route('/keywords', name: 'admin_keywords')]
    public function keywords(KeywordRepository $keywordRepo): Response
    {
        return $this->render('admin/keywords.html.twig', [
            'keywords' => $keywordRepo->findAll(),
        ]);
    }
}
