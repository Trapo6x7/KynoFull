<?php

namespace App\Controller\Admin;

use App\Entity\UserModeration;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IntegerField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextareaField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;

class UserModerationCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return UserModeration::class;
    }

    public function configureFields(string $pageName): iterable
    {
        return [
            IdField::new('id')->hideOnForm(),
            AssociationField::new('user', 'Utilisateur'),
            ChoiceField::new('actionType', 'Type d\'action')->setChoices([
                'Blocage' => UserModeration::ACTION_BLOCK,
                'Signalement' => UserModeration::ACTION_REPORT,
            ]),
            ChoiceField::new('targetType', 'Type de cible')->setChoices([
                'Utilisateur' => UserModeration::TARGET_USER,
                'Chien' => UserModeration::TARGET_DOG,
                'Groupe' => UserModeration::TARGET_GROUP,
                'Promenade' => UserModeration::TARGET_WALK,
                'Commentaire' => UserModeration::TARGET_COMMENT,
            ]),
            IntegerField::new('targetId', 'ID de la cible'),
            TextareaField::new('comment', 'Commentaire')->hideOnIndex(),
            ChoiceField::new('status', 'Statut')->setChoices([
                'En attente' => UserModeration::STATUS_PENDING,
                'Résolu' => UserModeration::STATUS_RESOLVED,
                'Rejeté' => UserModeration::STATUS_REJECTED,
            ])->hideOnForm(),
            DateTimeField::new('createdAt', 'Créé le')->hideOnForm(),
            DateTimeField::new('resolvedAt', 'Résolu le')->hideOnForm(),
        ];
    }
}
