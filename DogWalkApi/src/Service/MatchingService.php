<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserMatch;
use App\Repository\UserMatchRepository;
use Doctrine\ORM\EntityManagerInterface;

class MatchingService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserMatchRepository $matchRepository
    ) {}

    public function recordAction(User $user, User $targetUser, string $action): UserMatch
    {
        $existingMatch = $this->matchRepository->findMatchBetweenUsers($user, $targetUser);
        
        if ($existingMatch) {
            $existingMatch->setAction($action);
            $match = $existingMatch;
        } else {
            $match = new UserMatch();
            $match->setUser($user);
            $match->setTargetUser($targetUser);
            $match->setAction($action);
        }

        // Calculer le score de matching (extensible pour radar chart futur)
        if ($action === UserMatch::ACTION_LIKE) {
            $score = $this->calculateMatchScore($user, $targetUser);
            $match->setMatchScore($score);
        }

        $this->entityManager->persist($match);
        $this->entityManager->flush();

        return $match;
    }

    /**
     * Calcule le score de compatibilité entre deux users
     * TODO: Implémenter radar chart avec keywords, distance, etc.
     */
    private function calculateMatchScore(User $user, User $targetUser): string
    {
        $score = 0;
        $factors = 0;

        // Facteur 1: Keywords communs (à implémenter avec radar chart)
        // $commonKeywords = array_intersect($user->getKeywords() ?? [], $targetUser->getKeywords() ?? []);
        // $score += count($commonKeywords) * 10;
        // $factors++;

        // Facteur 2: Distance géographique (à implémenter)
        // if ($user->getLatitude() && $targetUser->getLatitude()) {
        //     $distance = $this->calculateDistance(...);
        //     $score += (100 - min($distance, 100));
        //     $factors++;
        // }

        // Pour l'instant, score basique
        $score = 50; // Score par défaut

        return number_format($score, 2);
    }

    public function getMutualMatches(User $user): array
    {
        return $this->matchRepository->findMutualLikes($user);
    }

    public function getUnseenUsers(User $user, array $allUsers): array
    {
        $seenIds = $this->matchRepository->getUsersAlreadySeen($user);
        
        return array_filter($allUsers, function($u) use ($user, $seenIds) {
            return $u->getId() !== $user->getId() && !in_array($u->getId(), $seenIds);
        });
    }
}
