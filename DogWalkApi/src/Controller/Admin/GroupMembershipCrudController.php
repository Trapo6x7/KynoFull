<?php

namespace App\Controller\Admin;

use App\Entity\GroupMembership;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;

class GroupMembershipCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return GroupMembership::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            AssociationField::new('user', 'Utilisateur'),
            AssociationField::new('walkGroup', 'Groupe'),
            ChoiceField::new('status', 'Statut')->setChoices([
                'Invité' => GroupMembership::STATUS_INVITED,
                'Demandé' => GroupMembership::STATUS_REQUESTED,
                'Actif' => GroupMembership::STATUS_ACTIVE,
                'Banni' => GroupMembership::STATUS_BANNED,
            ]),
            ChoiceField::new('role', 'Rôle')->setChoices([
                'Créateur' => GroupMembership::ROLE_CREATOR,
                'Admin' => GroupMembership::ROLE_ADMIN,
                'Membre' => GroupMembership::ROLE_MEMBER,
            ]),
            DateTimeField::new('createdAt', 'Créé le')->hideOnForm(),
            DateTimeField::new('updatedAt', 'Mis à jour')->hideOnForm(),
        ];
    }
}
