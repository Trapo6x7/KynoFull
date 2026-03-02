<?php

namespace App\Service;

use App\Contract\Repository\UserRepositoryInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Responsabilité unique : gérer toute la logique métier de vérification d'email.
 * Extrait d'EmailController qui portait à la fois le routing ET la logique (SOLID - SRP).
 * Les dépendances sont des abstractions (interfaces) → respecte DIP.
 */
class EmailVerificationService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly EntityManagerInterface $em,
        private readonly VerificationCodeGenerator $codeGenerator,
        private readonly UserVerificationMailer $verificationMailer,
        private readonly LoggerInterface $logger
    ) {}

    /**
     * Envoie l'email de vérification avec le code déjà existant de l'utilisateur.
     */
    public function sendVerification(string $email): void
    {
        $user = $this->findUserOrFail($email);
        $this->verificationMailer->sendVerificationEmail($user);
        $this->logger->info('Email de vérification envoyé', ['email' => $email]);
    }

    /**
     * Régénère un code et renvoie l'email de vérification.
     */
    public function resendVerification(string $email): void
    {
        $user = $this->findUserOrFail($email);

        $user->setVerificationCode($this->codeGenerator->generate());
        $user->setVerificationCodeExpiresAt(new \DateTimeImmutable('+24 hours'));
        $this->em->flush();

        $this->verificationMailer->sendVerificationEmail($user);
        $this->logger->info('Email de vérification renvoyé', ['email' => $email]);
    }

    /**
     * Vérifie le code soumis par l'utilisateur et marque son compte comme vérifié.
     *
     * @throws NotFoundHttpException    si l'utilisateur est introuvable
     * @throws BadRequestHttpException  si le code est invalide ou expiré
     */
    public function verifyCode(string $email, string $code): User
    {
        $user = $this->findUserOrFail($email);

        if ($user->isVerified()) {
            return $user;
        }

        if ($user->getVerificationCode() !== $code) {
            throw new BadRequestHttpException('Code invalide.');
        }

        if (!$user->isVerificationCodeValid()) {
            throw new BadRequestHttpException('Code expiré.');
        }

        $user->setIsVerified(true);
        $user->setVerificationCode(null);
        $user->setVerificationCodeExpiresAt(null);
        $this->em->flush();

        $this->logger->info('Email vérifié avec succès', ['email' => $email]);

        return $user;
    }

    /**
     * @throws NotFoundHttpException si aucun utilisateur trouvé avec cet email
     */
    private function findUserOrFail(string $email): User
    {
        $user = $this->userRepository->findOneBy(['email' => $email]);

        if (!$user instanceof User) {
            throw new NotFoundHttpException('Utilisateur non trouvé.');
        }

        return $user;
    }
}
