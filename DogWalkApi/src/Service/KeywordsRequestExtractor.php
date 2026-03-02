<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;

/**
 * Responsabilité unique : extraire et parser les keywords depuis le corps JSON d'une requête.
 * Extrait de KeywordsDenormalizeListener qui faisait à la fois l'écoute d'événement,
 * le parsing JSON et le stockage — trois responsabilités (SOLID - SRP).
 */
class KeywordsRequestExtractor
{
    /**
     * Extrait les keywords du corps JSON de la requête.
     * Retourne null si aucun champ "keywords" n'est présent.
     *
     * @return string[]|null
     */
    public function extract(Request $request): ?array
    {
        $content = $request->getContent();
        if (empty($content)) {
            return null;
        }

        try {
            $data = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        if (!isset($data['keywords']) || !is_array($data['keywords'])) {
            return null;
        }

        return $data['keywords'];
    }

    /**
     * Retourne le corps JSON sans le champ "keywords" (pour éviter les erreurs de désérialisation).
     */
    public function stripKeywords(Request $request): string
    {
        try {
            $data = json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $request->getContent();
        }

        unset($data['keywords']);

        return json_encode($data, JSON_THROW_ON_ERROR);
    }
}
