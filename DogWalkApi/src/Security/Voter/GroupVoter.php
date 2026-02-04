<?php

namespace App\Security\Voter;

use App\Entity\Group;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class GroupVoter extends Voter
{
    public const DELETE = 'GROUP_DELETE';
    public const EDIT = 'GROUP_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::DELETE, self::EDIT]) && $subject instanceof Group;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        /** @var User $user */
        $user = $token->getUser();
        if (!$user instanceof UserInterface) {
            return false;
        }

        /** @var Group $group */
        $group = $subject;

        switch ($attribute) {
            case self::DELETE:
            case self::EDIT:
                // Seul le créateur peut supprimer ou éditer le groupe
                return $group->getCreator()->getId() === $user->getId();
        }
        return false;
    }
}
