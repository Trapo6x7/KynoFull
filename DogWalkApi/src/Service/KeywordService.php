<?php

namespace App\Service;

use App\Entity\Keyword;
use App\Entity\Keywordable;
use App\Repository\KeywordableRepository;
use Doctrine\ORM\EntityManagerInterface;

/**
 * Service pour gérer les associations polymorphiques de keywords
 */
class KeywordService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private KeywordableRepository $keywordableRepository
    ) {
    }

    /**
     * Récupère tous les keywords pour une entité
     * 
     * @return Keyword[]
     */
    public function getKeywords(string $type, int $id): array
    {
        $keywordables = $this->keywordableRepository->findByKeywordable($type, $id);
        
        return array_map(fn(Keywordable $k) => $k->getKeyword(), $keywordables);
    }

    /**
     * Ajoute un keyword à une entité
     */
    public function addKeyword(string $type, int $id, Keyword $keyword): void
    {
        // Vérifie si l'association existe déjà
        $existing = $this->entityManager->getRepository(Keywordable::class)->findOneBy([
            'keywordableType' => $type,
            'keywordableId' => $id,
            'keyword' => $keyword
        ]);

        if ($existing) {
            return;
        }

        $keywordable = new Keywordable();
        $keywordable->setKeywordableType($type);
        $keywordable->setKeywordableId($id);
        $keywordable->setKeyword($keyword);

        $this->entityManager->persist($keywordable);
    }

    /**
     * Supprime un keyword d'une entité
     */
    public function removeKeyword(string $type, int $id, Keyword $keyword): void
    {
        $keywordable = $this->entityManager->getRepository(Keywordable::class)->findOneBy([
            'keywordableType' => $type,
            'keywordableId' => $id,
            'keyword' => $keyword
        ]);

        if ($keywordable) {
            $this->entityManager->remove($keywordable);
        }
    }

    /**
     * Synchronise les keywords d'une entité (remplace tous les keywords existants)
     * 
     * @param Keyword[]|string[] $keywords Tableau d'objets Keyword ou de noms de keywords
     */
    public function syncKeywords(string $type, int $id, array $keywords): void
    {
        // Supprime toutes les associations existantes
        $this->keywordableRepository->removeAllForKeywordable($type, $id);

        // Ajoute les nouvelles associations
        foreach ($keywords as $keyword) {
            // Si c'est une string, récupérer l'objet Keyword par son nom
            if (is_string($keyword)) {
                $keywordEntity = $this->entityManager->getRepository(Keyword::class)
                    ->findOneBy(['name' => $keyword]);
                if ($keywordEntity) {
                    $this->addKeyword($type, $id, $keywordEntity);
                }
            } elseif ($keyword instanceof Keyword) {
                $this->addKeyword($type, $id, $keyword);
            }
        }
    }
}
