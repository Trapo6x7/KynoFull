<?php

namespace App\Dto;

use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

final class UserPasswordUpdateDto
{
    #[Assert\NotBlank]
    #[Groups(['pass:patch'])]
    public ?string $oldPassword = null;

    #[Assert\NotBlank]
    #[Assert\Length(min: 6)]
    #[Groups(['pass:patch'])]
    public ?string $password = null;
}
