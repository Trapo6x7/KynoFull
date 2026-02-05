<?php

namespace App\EventListener;

use App\Entity\Dog;
use App\Entity\User;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Listener pour extraire les keywords de la requête avant la désérialisation
 * et les stocker temporairement pour que le DataPersister puisse les récupérer
 */
#[AsEventListener(event: KernelEvents::REQUEST, priority: 10)]
class KeywordsDenormalizeListener
{
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        // Vérifier si c'est une requête API Platform pour créer ou modifier un Dog ou User
        if (!$request->attributes->has('_api_resource_class')) {
            return;
        }

        $resourceClass = $request->attributes->get('_api_resource_class');
        
        // Traiter uniquement les entités Dog et User
        if (!in_array($resourceClass, [Dog::class, User::class])) {
            return;
        }

        // Récupérer le contenu JSON
        $content = $request->getContent();
        if (empty($content)) {
            return;
        }

        try {
            $data = json_decode($content, true);
            
            // Si des keywords sont présents dans les données
            if (isset($data['keywords']) && is_array($data['keywords'])) {
                // Stocker les keywords dans les attributs de la requête
                $request->attributes->set('_keywords', $data['keywords']);
                
                // Retirer les keywords du contenu pour éviter l'erreur de désérialisation
                unset($data['keywords']);
                $request->initialize(
                    $request->query->all(),
                    $request->request->all(),
                    $request->attributes->all(),
                    $request->cookies->all(),
                    $request->files->all(),
                    $request->server->all(),
                    json_encode($data)
                );
            }
        } catch (\Exception $e) {
            // Ignorer les erreurs de parsing JSON
            error_log("KeywordsDenormalizeListener error: " . $e->getMessage());
        }
    }
}
