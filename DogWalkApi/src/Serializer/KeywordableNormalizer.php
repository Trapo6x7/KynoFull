<?php

namespace App\Serializer;

use App\Entity\Dog;
use App\Entity\Group;
use App\Entity\User;
use App\Service\KeywordService;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

/**
 * Normalizer qui charge automatiquement les keywords pour les entités User, Dog et Group
 */
class KeywordableNormalizer implements NormalizerInterface, NormalizerAwareInterface
{
    use NormalizerAwareTrait;

    private const ALREADY_CALLED = 'KEYWORDABLE_NORMALIZER_ALREADY_CALLED';

    public function __construct(
        private readonly KeywordService $keywordService
    ) {}

    /**
     * @param User|Dog|Group $object
     */
    public function normalize(mixed $object, ?string $format = null, array $context = []): array|string|int|float|bool|\ArrayObject|null
    {
        // Évite les appels récursifs infinis
        $context[self::ALREADY_CALLED] = true;

        // Charge les keywords pour cette entité
        $type = $object::getKeywordableType();
        $id = $object->getId();

        if ($id !== null) {
            $keywords = $this->keywordService->getKeywords($type, $id);
            $object->setKeywords($keywords);
        }

        return $this->normalizer->normalize($object, $format, $context);
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        // Évite les appels récursifs
        if (isset($context[self::ALREADY_CALLED])) {
            return false;
        }

        return $data instanceof User || $data instanceof Dog || $data instanceof Group;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [
            User::class => false,
            Dog::class => false,
            Group::class => false,
        ];
    }
}
