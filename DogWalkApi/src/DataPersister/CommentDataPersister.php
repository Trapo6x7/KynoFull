<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Comment;
use Symfony\Bundle\SecurityBundle\Security;

class CommentDataPersister implements ProcessorInterface
{
    private $persistProcessor;
    private $security;

    public function __construct(ProcessorInterface $persistProcessor, Security $security)
    {
        $this->persistProcessor = $persistProcessor;
        $this->security = $security;
    }

    public function process($data, Operation $operation, array $uriVariables = [], array $context = [])
    {
        if ($data instanceof Comment && $operation instanceof Post) {
            $user = $this->security->getUser();
            $data->setUser($user);
        }
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}