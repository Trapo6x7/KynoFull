<?php

namespace App\Contract;

use App\Entity\Keyword;

/**
 * Abstraction du service de synchronisation de keywords.
 * Respecte ISP : seules les méthodes consommées par les DataPersisters sont déclarées.
 * Respecte DIP : les DataPersisters dépendent de cette abstraction, pas de KeywordService.
 * Respecte OCP : on peut implémenter un TagSynchronizer ou CacheableKeywordSynchronizer
 *                sans modifier les DataPersisters.
 */
interface KeywordSynchronizerInterface
{
    /**
     * Synchronise les keywords d'une entité : supprime les anciens, ajoute les nouveaux.
     *
     * @param string   $type     Type de l'entité (ex: 'dog', 'user', 'group')
     * @param int      $id       ID de l'entité
     * @param string[] $keywords Tableau de noms de keywords
     */
    public function syncKeywords(string $type, int $id, array $keywords): void;

    /**
     * Retourne les keywords d'une entité.
     *
     * @return Keyword[]
     */
    public function getKeywords(string $type, int $id): array;
}
