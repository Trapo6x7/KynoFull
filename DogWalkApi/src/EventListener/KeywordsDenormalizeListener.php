<?php

namespace App\EventListener;

use App\Contract\KeywordableInterface;
use App\Service\KeywordsRequestExtractor;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Responsabilité unique : écouter l'événement kernel.request et stocker les keywords
 * extraits dans les attributs de la requête pour les DataPersisters.
 * La logique d'extraction JSON est déléguée à KeywordsRequestExtractor (SOLID - SRP).
 */
#[AsEventListener(event: KernelEvents::REQUEST, priority: 10)]
class KeywordsDenormalizeListener
{
    public function __construct(
        private readonly KeywordsRequestExtractor $extractor
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();

        if (!$request->attributes->has('_api_resource_class')) {
            return;
        }

        $resourceClass = $request->attributes->get('_api_resource_class');

        // OCP : toute entité implémentant KeywordableInterface est automatiquement supportée
        if (!is_a($resourceClass, KeywordableInterface::class, true)) {
            return;
        }

        $keywords = $this->extractor->extract($request);

        if ($keywords === null) {
            return;
        }

        // Stocker pour les DataPersisters
        $request->attributes->set('_keywords', $keywords);

        // Retirer du corps JSON pour éviter les erreurs de désérialisation API Platform
        $request->initialize(
            $request->query->all(),
            $request->request->all(),
            $request->attributes->all(),
            $request->cookies->all(),
            $request->files->all(),
            $request->server->all(),
            $this->extractor->stripKeywords($request)
        );
    }
}
