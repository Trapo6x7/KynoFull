<?php

namespace App\Service;

/**
 * Responsabilité unique : générer un code de vérification à 6 chiffres.
 * Extrait de UserDataPersister et EmailController (SOLID - SRP).
 */
class VerificationCodeGenerator
{
    public function generate(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
