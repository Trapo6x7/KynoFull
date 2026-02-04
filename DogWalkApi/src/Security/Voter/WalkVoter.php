<?php

namespace App\Security\Voter;

use App\Entity\Group;
use App\Entity\GroupMembership;
use App\Entity\User;
use App\Entity\Walk;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class WalkVoter extends Voter
{
    public const EDIT = 'WALK_EDIT';
    public const VIEW = 'WALK_VIEW';
    public const CREATE = 'WALK_CREATE';
    public const DELETE = 'WALK_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        // Autoriser WALK_CREATE même si $subject est null
        if ($attribute === self::CREATE) {
            return true;
        }

        return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE])
            && $subject instanceof Walk;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        /** @var User $user */
        $user = $token->getUser();
        
        if (!$user instanceof UserInterface) {
            return false;
        }

        // Gérer le cas spécifique de WALK_CREATE
        if ($attribute === self::CREATE) {
            // Vérifier si l'utilisateur est membre actif d'au moins un groupe
            foreach ($user->getMemberships() as $membership) {
                if ($membership->isActive() && in_array($membership->getRole(), [GroupMembership::ROLE_MEMBER, GroupMembership::ROLE_CREATOR])) {
                    return true;
                }
            }
            return false;
        }

        // Récupérer le groupe de la promenade
        $walkGroup = $subject->getWalkGroup();

        if (!$walkGroup) {
            return false;
        }

        // Vérifier si l'utilisateur est membre du groupe
        if (!$this->isUserInGroup($user, $walkGroup)) {
            return false;
        }

        // Gestion des permissions selon l'attribut
        switch ($attribute) {
            case self::VIEW:
            case self::CREATE:
                // Les membres du groupe peuvent voir et créer des promenades
                return true;
            case self::EDIT:
            case self::DELETE:
                return false;
        }

        return false;
    }

    public function isUserInGroup(User $user, Group $group): bool
    {
        foreach ($user->getMemberships() as $membership) {
            if (
                $membership->getWalkGroup()->getId() === $group->getId() &&
                $membership->isActive() &&
                in_array($membership->getRole(), [GroupMembership::ROLE_MEMBER, GroupMembership::ROLE_CREATOR])
            ) {
                return true;
            }
        }
        return false;
    }
}
