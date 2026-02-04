<?php

namespace App\Security\Voter;

use App\Entity\GroupMembership;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class MembershipVoter extends Voter
{
    public const EDIT = 'MEMBERSHIP_EDIT';
    public const DELETE = 'MEMBERSHIP_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::DELETE])
            && $subject instanceof GroupMembership;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        
        if (!$user instanceof UserInterface) {
            return false;
        }

        /** @var GroupMembership $membership */
        $membership = $subject;
        $group = $membership->getWalkGroup();

        switch ($attribute) {
            case self::EDIT:
                // Seul le créateur du groupe peut modifier un membership (accepter/refuser)
                return $this->canEdit($membership, $user, $group);
            case self::DELETE:
                // L'utilisateur peut supprimer sa propre demande, ou le créateur peut retirer un membre
                return $this->canDelete($membership, $user, $group);
        }

        return false;
    }

    private function canEdit(GroupMembership $membership, User $user, $group): bool
    {
        // Vérifier si l'utilisateur est CREATOR du groupe
        foreach ($group->getMemberships() as $m) {
            if ($m->getUser() === $user && $m->getRole() === GroupMembership::ROLE_CREATOR && $m->isActive()) {
                return true;
            }
        }
        return false;
    }

    private function canDelete(GroupMembership $membership, User $user, $group): bool
    {
        // L'utilisateur peut supprimer sa propre demande/membership
        if ($membership->getUser() === $user) {
            return true;
        }

        // Le créateur peut retirer n'importe quel membre (sauf lui-même)
        foreach ($group->getMemberships() as $m) {
            if ($m->getUser() === $user && $m->getRole() === GroupMembership::ROLE_CREATOR && $m->isActive()) {
                return true;
            }
        }

        return false;
    }
}
