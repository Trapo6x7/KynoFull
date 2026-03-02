<?php

namespace App\Security\Voter;

use App\Entity\Group;
use App\Entity\User;
use App\Entity\Walk;
use App\Service\GroupMembershipChecker;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

final class WalkVoter extends Voter
{
    public const EDIT = 'WALK_EDIT';
    public const VIEW = 'WALK_VIEW';
    public const CREATE = 'WALK_CREATE';
    public const DELETE = 'WALK_DELETE';

    public function __construct(
        private readonly GroupMembershipChecker $membershipChecker
    ) {}

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
            return $this->membershipChecker->isActiveMemberOfAnyGroup($user);
        }

        // Récupérer le groupe de la promenade
        $walkGroup = $subject->getWalkGroup();

        if (!$walkGroup) {
            return false;
        }

        // Gestion des permissions selon l'attribut
        return match ($attribute) {
            self::VIEW  => $this->membershipChecker->isMemberOf($user, $walkGroup),
            self::EDIT,
            self::DELETE => false,
            default      => false,
        };
    }

    /**
     * @deprecated Utiliser GroupMembershipChecker::isMemberOf() directement.
     */
    public function isUserInGroup(User $user, Group $group): bool
    {
        return $this->membershipChecker->isMemberOf($user, $group);
    }
}
