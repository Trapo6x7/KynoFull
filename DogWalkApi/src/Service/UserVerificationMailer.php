<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

/**
 * Responsabilité unique : construire et envoyer l'email de vérification.
 * Extrait d'EmailController (SOLID - SRP).
 * En injectant MailerInterface et Twig\Environment (abstractions), on respecte DIP.
 */
class UserVerificationMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly Environment $twig
    ) {}

    public function sendVerificationEmail(User $user): void
    {
        $html = $this->twig->render('email/verification_responsive.html.twig', [
            'verificationCode' => $user->getVerificationCode(),
        ]);

        $message = (new Email())
            ->from('noreply@dogwalk.app')
            ->to($user->getEmail())
            ->subject('Vérifiez votre adresse email - DogWalk')
            ->html($html);

        $this->mailer->send($message);
    }
}
