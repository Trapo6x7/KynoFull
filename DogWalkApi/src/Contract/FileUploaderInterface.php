<?php

namespace App\Contract;

use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Abstraction du système de stockage de fichiers.
 * Respecte ISP : seules les opérations réellement nécessaires sont déclarées.
 * Respecte DIP : les classes consommatrices dépendent de cette interface, pas de LocalFileUploader.
 * Respecte OCP : demain on peut implémenter S3FileUploader sans toucher au code appelant.
 */
interface FileUploaderInterface
{
    /**
     * Stocke le fichier et retourne le nom de fichier généré.
     */
    public function upload(UploadedFile $file): string;
}
