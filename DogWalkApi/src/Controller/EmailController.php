<?php

namespace App\Controller;

use App\Service\EmailVerificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Responsabilité unique : gérer le routing HTTP des endpoints email.
 * Toute la logique métier (génération de code, envoi, vérification) est
 * déléguée à EmailVerificationService (SOLID - SRP, DIP).
 */
#[Route('/api/emails')]
class EmailController extends AbstractController
{
    public function __construct(
        private readonly EmailVerificationService $emailVerificationService
    ) {}

    #[Route('/verify', name: 'api_email_verify', methods: ['POST'])]
    public function sendVerificationEmail(Request $request): JsonResponse
    {
        $email = $this->extractEmail($request);

        try {
            $this->emailVerificationService->sendVerification($email);
            return $this->json(['message' => 'Email de vérification envoyé']);
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors de l\'envoi de l\'email', 'details' => $e->getMessage()], 500);
        }
    }

    #[Route('/resend-verification', name: 'api_email_resend', methods: ['POST'])]
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        $email = $this->extractEmail($request);

        try {
            $this->emailVerificationService->resendVerification($email);
            return $this->json(['message' => 'Email de vérification renvoyé']);
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], 404);
        } catch (\Exception $e) {
            return $this->json(['error' => 'Erreur lors du renvoi de l\'email', 'details' => $e->getMessage()], 500);
        }
    }

    #[Route('/verify-code', name: 'api_email_verify_code', methods: ['POST'])]
    public function verifyCode(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;
        $code  = $data['code'] ?? null;

        if (!$email || !$code) {
            return $this->json(['error' => 'Email et code requis'], 400);
        }

        try {
            $user = $this->emailVerificationService->verifyCode($email, $code);

            return $this->json(['message' => $user->isVerified() ? 'Email vérifié avec succès' : 'Email déjà vérifié']);
        } catch (NotFoundHttpException $e) {
            return $this->json(['error' => $e->getMessage()], 404);
        } catch (BadRequestHttpException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Extrait et valide le champ "email" du corps de la requête.
     */
    private function extractEmail(Request $request): string
    {
        $data  = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            throw new BadRequestHttpException('Email requis.');
        }

        return $email;
    }
}

