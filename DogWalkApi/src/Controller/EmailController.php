<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Psr\Log\LoggerInterface;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/emails')]
class EmailController extends AbstractController
{
    public function __construct(
        private MailerInterface $mailer,
        private LoggerInterface $logger,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/verify', name: 'api_email_verify', methods: ['POST'])]
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return $this->json(['error' => 'Email requis'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        try {
            $message = (new Email())
                ->from('noreply@dogwalk.app')
                ->to($email)
                ->subject('Vérifiez votre adresse email - DogWalk')
                ->html($this->renderEmailTemplate($user));

            $this->mailer->send($message);
            
            $this->logger->info('Email de vérification envoyé', ['email' => $email]);
            
            return $this->json(['message' => 'Email de vérification envoyé']);
        } catch (\Exception $e) {
            $this->logger->error('Erreur envoi email de vérification', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            
            return $this->json([
                'error' => 'Erreur lors de l\'envoi de l\'email',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/resend-verification', name: 'api_email_resend', methods: ['POST'])]
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return $this->json(['error' => 'Email requis'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Régénérer un nouveau code
        $verificationCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->setVerificationCode($verificationCode);
        $user->setVerificationCodeExpiresAt(new \DateTimeImmutable('+24 hours'));
        $this->entityManager->flush();

        try {
            $message = (new Email())
                ->from('noreply@dogwalk.app')
                ->to($email)
                ->subject('Vérifiez votre adresse email - DogWalk')
                ->html($this->renderEmailTemplate($user));

            $this->mailer->send($message);
            
            $this->logger->info('Email de vérification renvoyé', ['email' => $email]);
            
            return $this->json(['message' => 'Email de vérification renvoyé']);
        } catch (\Exception $e) {
            $this->logger->error('Erreur renvoi email de vérification', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            
            return $this->json([
                'error' => 'Erreur lors du renvoi de l\'email',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/verify-code', name: 'api_email_verify_code', methods: ['POST'])]
    public function verifyCode(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $code = $data['code'] ?? null;

        if (!$email || !$code) {
            return $this->json(['error' => 'Email et code requis'], 400);
        }

        $user = $this->userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérifier si l'utilisateur est déjà vérifié
        if ($user->isVerified()) {
            return $this->json(['message' => 'Email déjà vérifié']);
        }

        // Vérifier le code
        if ($user->getVerificationCode() !== $code) {
            return $this->json(['error' => 'Code invalide'], 400);
        }

        // Vérifier si le code n'est pas expiré
        if (!$user->isVerificationCodeValid()) {
            return $this->json(['error' => 'Code expiré'], 400);
        }

        // Marquer l'utilisateur comme vérifié
        $user->setIsVerified(true);
        $user->setVerificationCode(null);
        $user->setVerificationCodeExpiresAt(null);
        $this->entityManager->flush();

        $this->logger->info('Email vérifié avec succès', ['email' => $email]);

        return $this->json(['message' => 'Email vérifié avec succès']);
    }

    private function renderEmailTemplate(User $user): string
    {
        return $this->renderView('email/verification_responsive.html.twig', [
            'verificationCode' => $user->getVerificationCode(),
        ]);
    }
}
