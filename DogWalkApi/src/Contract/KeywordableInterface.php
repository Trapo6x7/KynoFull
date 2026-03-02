<?php

namespace App\Contract;

/**
 * Interface marqueur pour les entités supportant le système de keywords.
 *
 * Remplace le tableau statique SUPPORTED_CLASSES dans KeywordsDenormalizeListener.
 * Respecte OCP : ajouter une entité keywordable = implémenter cette interface,
 * sans toucher au listener.
 *
 * Le type keyword (ex: 'dog', 'user') reste déclaré dans chaque entité
 * via la méthode statique getKeywordableType() héritée de la convention existante.
 */
interface KeywordableInterface
{
    /**
     * Retourne le type keyword de l'entité (ex: 'dog', 'user', 'group').
     * Utilisé par KeywordService pour l'association polymorphique.
     */
    public static function getKeywordableType(): string;
}
