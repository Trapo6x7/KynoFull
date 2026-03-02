<?php

namespace App\Service;

use App\Contract\FileUploaderInterface;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Implémentation locale (disque) du stockage de fichiers.
 * Implémente FileUploaderInterface → on peut substituer par S3FileUploader sans changer les appelants (DIP, OCP).
 */
class FileUploader implements FileUploaderInterface
{
    public function __construct(
        private readonly string $targetDirectory,
        private readonly SluggerInterface $slugger,
    ) {}

    public function upload(UploadedFile $file): string
    {
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $fileName = $safeFilename.'-'.uniqid().'.'.$file->guessExtension();

        try {
            $file->move($this->targetDirectory, $fileName);
        } catch (FileException $e) {
            throw new \RuntimeException('Failed to upload file');
        }

        return $fileName;
    }
}
