<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Entity\Walk;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class WalkVoter extends Voter
{
    public const EDIT = 'WALK_EDIT';
    public const VIEW = 'WALK_VIEW';
    public const DELETE = 'WALK_DELETE';

    protected function supports(string $attribute, mixed $subject): bool
    {
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

        /** @var Walk $walk */
        $walk = $subject;

        return match ($attribute) {
            self::VIEW   => true,
            self::EDIT   => $walk->getUser()?->getId() === $user->getId(),
            self::DELETE => $walk->getUser()?->getId() === $user->getId(),
            default      => false,
        };
    }
}
