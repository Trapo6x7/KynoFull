<?php

namespace App\Service;

use App\Entity\Group;
use App\Entity\GroupMembership;
use App\Entity\User;

/**
 * Service SRP : encapsule toute la logique de vérification d'appartenance à un groupe.
 *
 * Avant ce refactoring, la même logique était dupliquée dans :
 *   – WalkVoter::isUserInGroup()
 *   – WalkVoter::voteOnAttribute() (WALK_CREATE)
 *   – WalkDataPersister::process()
 *
 * Centraliser ici respecte DRY et SRP, et rend la règle métier facilement testable
 * de manière isolée (aucune dépendance vers Doctrine ni Symfony Security).
 */
final class GroupMembershipChecker
{
    /**
     * Indique si un utilisateur est membre actif d'un groupe donné
     * avec le rôle MEMBER ou CREATOR.
     */
    public function isMemberOf(User $user, Group $group): bool
    {
        foreach ($user->getMemberships() as $membership) {
            if (
                $membership->getWalkGroup()->getId() === $group->getId()
                && $membership->isActive()
                && in_array($membership->getRole(), [GroupMembership::ROLE_MEMBER, GroupMembership::ROLE_CREATOR], true)
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Indique si un utilisateur est membre actif d'au moins un groupe.
     * Utilisé par WALK_CREATE pour vérifier qu'il a accès à créer une promenade.
     */
    public function isActiveMemberOfAnyGroup(User $user): bool
    {
        foreach ($user->getMemberships() as $membership) {
            if (
                $membership->isActive()
                && in_array($membership->getRole(), [GroupMembership::ROLE_MEMBER, GroupMembership::ROLE_CREATOR], true)
            ) {
                return true;
            }
        }

        return false;
    }
}
