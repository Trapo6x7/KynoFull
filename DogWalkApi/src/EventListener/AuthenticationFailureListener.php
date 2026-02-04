<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationFailureEvent;
use Symfony\Component\HttpFoundation\JsonResponse;

class AuthenticationFailureListener
{
    public function onAuthenticationFailure(AuthenticationFailureEvent $event)
    {
        $data = [
            'status'  => '401 Unauthorized',
            'message' => $event->getException()->getMessage()
        ];

        $response = new JsonResponse($data, 401);
        $event->setResponse($response);
    }
}