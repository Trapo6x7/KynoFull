<?php

namespace App\EventListener;

use App\Event\UserRegisteredEvent;
use App\Service\UserVerificationMailer;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

/**
 * Listener SRP : envoie automatiquement l'email de vérification après inscription.
 *
 * Avant ce refactoring : l'envoi de l'email de vérification était une action manuelle
 * déclenchée explicitement par le client via EmailController (/verification/send).
 * L'utilisateur pouvait s'inscrire sans recevoir d'email si cette route n'était pas appelée.
 *
 * Après refactoring : l'email est envoyé automatiquement au moment de la création du compte,
 * ce qui rend le flux d'inscription complet et robuste.
 *
 * Principe OCP : ce comportement est ajouté sans toucher à UserDataPersister.
 */
#[AsEventListener(event: UserRegisteredEvent::class)]
final class UserRegisteredEmailListener
{
    public function __construct(
        private readonly UserVerificationMailer $mailer,
        private readonly LoggerInterface $logger
    ) {}

    public function __invoke(UserRegisteredEvent $event): void
    {
        $user = $event->getUser();

        try {
            $this->mailer->sendVerificationEmail($user);
            $this->logger->info('Email de vérification envoyé à {email} après inscription.', [
                'email' => $user->getEmail(),
            ]);
        } catch (\Throwable $e) {
            // L'email est non-bloquant : log l'erreur sans interrompre l'inscription
            $this->logger->error('Échec de l\'envoi de l\'email de vérification pour {email} : {error}', [
                'email' => $user->getEmail(),
                'error' => $e->getMessage(),
            ]);
        }
    }
}
