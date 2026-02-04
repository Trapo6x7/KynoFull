<?php

namespace App\Entity;

use App\Repository\UserModerationRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Entité polymorphique unifiée pour gérer les actions de modération utilisateur
 * Remplace BlockList et Report en une seule table
 */
#[ORM\Entity(repositoryClass: UserModerationRepository::class)]
#[ORM\Table(name: 'user_moderation')]
#[ORM\Index(columns: ['action_type'], name: 'idx_action_type')]
#[ORM\Index(columns: ['target_type', 'target_id'], name: 'idx_target')]
#[ORM\Index(columns: ['status'], name: 'idx_status')]
#[ApiResource(
    normalizationContext: ['groups' => ['moderation:read']],
    denormalizationContext: ['groups' => ['moderation:write']],
    operations: [
        new Get(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        ),
        new GetCollection(
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            security: "is_granted('ROLE_USER')"
        ),
        new Patch(
            security: "is_granted('ROLE_ADMIN')",
            denormalizationContext: ['groups' => ['moderation:admin']]
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN') or object.getUser() == user"
        )
    ]
)]
class UserModeration
{
    // Types d'actions
    public const ACTION_BLOCK = 'block';
    public const ACTION_REPORT = 'report';

    // Types de cibles (polymorphique)
    public const TARGET_USER = 'user';
    public const TARGET_DOG = 'dog';
    public const TARGET_GROUP = 'group';
    public const TARGET_WALK = 'walk';
    public const TARGET_COMMENT = 'comment';

    // Status (pour les reports)
    public const STATUS_PENDING = 'pending';
    public const STATUS_RESOLVED = 'resolved';
    public const STATUS_REJECTED = 'rejected';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['moderation:read'])]
    private ?int $id = null;

    /**
     * L'utilisateur qui effectue l'action (bloquer/signaler)
     */
    #[ORM\ManyToOne(inversedBy: 'moderations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['moderation:read', 'moderation:write'])]
    private ?User $user = null;

    /**
     * Type d'action: block, report
     */
    #[ORM\Column(length: 50)]
    #[Groups(['moderation:read', 'moderation:write'])]
    private ?string $actionType = null;

    /**
     * Type de la cible: user, dog, group, walk, comment
     */
    #[ORM\Column(length: 50)]
    #[Groups(['moderation:read', 'moderation:write'])]
    private ?string $targetType = null;

    /**
     * ID de la cible
     */
    #[ORM\Column]
    #[Groups(['moderation:read', 'moderation:write'])]
    private ?int $targetId = null;

    /**
     * Commentaire/raison (optionnel, surtout pour les reports)
     */
    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['moderation:read', 'moderation:write'])]
    private ?string $comment = null;

    /**
     * Status (pour les reports): pending, resolved, rejected
     * NULL pour les blocks
     */
    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['moderation:read', 'moderation:admin'])]
    private ?string $status = null;

    #[ORM\Column]
    #[Groups(['moderation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    /**
     * Date de résolution (pour les reports)
     */
    #[ORM\Column(nullable: true)]
    #[Groups(['moderation:read'])]
    private ?\DateTimeImmutable $resolvedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->status = self::STATUS_PENDING;
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

    public function getActionType(): ?string
    {
        return $this->actionType;
    }

    public function setActionType(string $actionType): static
    {
        $this->actionType = $actionType;

        return $this;
    }

    public function getTargetType(): ?string
    {
        return $this->targetType;
    }

    public function setTargetType(string $targetType): static
    {
        $this->targetType = $targetType;

        return $this;
    }

    public function getTargetId(): ?int
    {
        return $this->targetId;
    }

    public function setTargetId(int $targetId): static
    {
        $this->targetId = $targetId;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(?string $status): static
    {
        $this->status = $status;

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

    public function getResolvedAt(): ?\DateTimeImmutable
    {
        return $this->resolvedAt;
    }

    public function setResolvedAt(?\DateTimeImmutable $resolvedAt): static
    {
        $this->resolvedAt = $resolvedAt;

        return $this;
    }

    /**
     * Marque le report comme résolu
     */
    public function resolve(): static
    {
        if ($this->actionType === self::ACTION_REPORT) {
            $this->status = self::STATUS_RESOLVED;
            $this->resolvedAt = new \DateTimeImmutable();
        }
        return $this;
    }

    /**
     * Marque le report comme rejeté
     */
    public function reject(): static
    {
        if ($this->actionType === self::ACTION_REPORT) {
            $this->status = self::STATUS_REJECTED;
            $this->resolvedAt = new \DateTimeImmutable();
        }
        return $this;
    }

    /**
     * Vérifie si c'est un blocage
     */
    public function isBlock(): bool
    {
        return $this->actionType === self::ACTION_BLOCK;
    }

    /**
     * Vérifie si c'est un signalement
     */
    public function isReport(): bool
    {
        return $this->actionType === self::ACTION_REPORT;
    }

    /**
     * Vérifie si le report est en attente
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    // Méthodes de compatibilité avec BlockList (deprecated)

    /**
     * @deprecated Utiliser getUser() à la place
     */
    public function getBlocker(): ?User
    {
        return $this->user;
    }

    /**
     * @deprecated Utiliser setUser() à la place
     */
    public function setBlocker(?User $blocker): static
    {
        $this->user = $blocker;
        return $this;
    }

    // Méthodes de compatibilité avec Report (deprecated)

    /**
     * @deprecated Utiliser getUser() à la place
     */
    public function getReporter(): ?User
    {
        return $this->user;
    }

    /**
     * @deprecated Utiliser setUser() à la place
     */
    public function setReporter(?User $reporter): static
    {
        $this->user = $reporter;
        return $this;
    }
}
