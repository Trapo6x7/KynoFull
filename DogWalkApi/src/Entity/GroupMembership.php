<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\DataPersister\GroupMembershipDataPersister;
use App\Repository\GroupMembershipRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Entité unifiée pour gérer l'appartenance à un groupe
 * Remplace GroupRole et GroupRequest en une seule table avec status et role
 */
#[ORM\Entity(repositoryClass: GroupMembershipRepository::class)]
#[ORM\Table(name: 'group_membership')]
#[ORM\Index(columns: ['status'], name: 'idx_status')]
#[ORM\UniqueConstraint(name: 'unique_user_group', columns: ['user_id', 'group_id'])]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['membership:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['membership:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Post(
            processor: GroupMembershipDataPersister::class,
            denormalizationContext: ['groups' => ['membership:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Patch(
            denormalizationContext: ['groups' => ['membership:patch']],
            security: "is_granted('MEMBERSHIP_EDIT', object)"
        ),
        new Delete(
            security: "is_granted('MEMBERSHIP_DELETE', object)"
        ),
    ]
)]
class GroupMembership
{
    // Status possibles
    public const STATUS_INVITED = 'invited';      // L'utilisateur a été invité par un admin
    public const STATUS_REQUESTED = 'requested';  // L'utilisateur a demandé à rejoindre
    public const STATUS_ACTIVE = 'active';        // Membre actif du groupe
    public const STATUS_BANNED = 'banned';        // Banni du groupe

    // Rôles possibles (uniquement pour les membres actifs)
    public const ROLE_CREATOR = 'CREATOR';
    public const ROLE_ADMIN = 'ADMIN';
    public const ROLE_MEMBER = 'MEMBER';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['membership:read', 'group:details', 'me:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'memberships')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['membership:read', 'membership:write', 'group:details'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'memberships')]
    #[ORM\JoinColumn(nullable: false, name: 'group_id')]
    #[Groups(['membership:read', 'membership:write', 'me:read'])]
    private ?Group $walkGroup = null;

    /**
     * Status de l'appartenance: invited, requested, active, banned
     */
    #[ORM\Column(length: 50)]
    #[Groups(['membership:read', 'membership:write', 'membership:patch', 'group:details', 'me:read'])]
    private ?string $status = self::STATUS_REQUESTED;

    /**
     * Rôle dans le groupe (uniquement pour status = active): CREATOR, ADMIN, MEMBER
     */
    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['membership:read', 'membership:patch', 'group:details', 'me:read'])]
    private ?string $role = self::ROLE_MEMBER;

    #[ORM\Column]
    #[Groups(['membership:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['membership:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
        $this->status = self::STATUS_REQUESTED;
        $this->role = self::ROLE_MEMBER;
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

    public function getWalkGroup(): ?Group
    {
        return $this->walkGroup;
    }

    public function setWalkGroup(?Group $walkGroup): static
    {
        $this->walkGroup = $walkGroup;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;
        $this->updatedAt = new \DateTimeImmutable();

        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(?string $role): static
    {
        $this->role = $role;
        $this->updatedAt = new \DateTimeImmutable();

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

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * Accepte une demande ou une invitation
     */
    public function accept(): static
    {
        if ($this->status === self::STATUS_REQUESTED || $this->status === self::STATUS_INVITED) {
            $this->status = self::STATUS_ACTIVE;
            $this->updatedAt = new \DateTimeImmutable();
        }
        return $this;
    }

    /**
     * Vérifie si le membre est actif
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Vérifie si c'est le créateur
     */
    public function isCreator(): bool
    {
        return $this->role === self::ROLE_CREATOR;
    }

    /**
     * Vérifie si c'est un admin ou le créateur
     */
    public function isAdminOrCreator(): bool
    {
        return $this->role === self::ROLE_ADMIN || $this->role === self::ROLE_CREATOR;
    }
}
