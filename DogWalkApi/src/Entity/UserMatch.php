<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\UserMatchRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: UserMatchRepository::class)]
#[ORM\Table(name: 'user_match')]
#[ORM\Index(columns: ['action'], name: 'IDX_ACTION')]
#[ORM\UniqueConstraint(name: 'unique_user_target', columns: ['user_id', 'target_user_id'])]
#[ApiResource(
    operations: [
        new Post(
            processor: \App\DataPersister\UserMatchDataPersister::class,
            denormalizationContext: ['groups' => ['match:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['match:read', 'user:id']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['match:read']],
            security: "is_granted('ROLE_USER')"
        ),
    ]
)]
class UserMatch
{
    public const ACTION_LIKE = 'like';
    public const ACTION_DISLIKE = 'dislike';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['match:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['match:read', 'match:write'])]
    #[SerializedName('user')]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['match:read', 'match:write'])]
    #[SerializedName('targetUser')]
    private ?User $targetUser = null;

    #[ORM\Column(length: 20)]
    #[Groups(['match:read', 'match:write'])]
    private ?string $action = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 2, nullable: true)]
    #[Groups(['match:read'])]
    private ?string $matchScore = null;

    #[ORM\Column]
    #[Groups(['match:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getTargetUser(): ?User
    {
        return $this->targetUser;
    }

    public function setTargetUser(?User $targetUser): static
    {
        $this->targetUser = $targetUser;
        return $this;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;
        return $this;
    }

    public function getMatchScore(): ?string
    {
        return $this->matchScore;
    }

    public function setMatchScore(?string $matchScore): static
    {
        $this->matchScore = $matchScore;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function isLike(): bool
    {
        return $this->action === self::ACTION_LIKE;
    }

    public function isDislike(): bool
    {
        return $this->action === self::ACTION_DISLIKE;
    }
}
