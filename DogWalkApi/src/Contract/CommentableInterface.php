<?php

namespace App\Contract;

/**
 * Marque une entité comme pouvant être commentée.
 * Respecte OCP : ajouter un nouveau type commentable ne nécessite plus de modifier
 *               la classe Comment — il suffit d'implémenter cette interface.
 * Respecte ISP : interface minimale, une seule responsabilité déclarée.
 *
 * Entités qui implémentent cette interface : Walk, Group, Dog, User.
 */
interface CommentableInterface
{
    /**
     * Retourne le discriminant de type utilisé dans la colonne polymorphique.
     * Doit correspondre aux constantes TYPE_* de Comment.
     */
    public function getCommentableType(): string;
}
