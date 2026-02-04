<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\CommentRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\DataPersister\CommentDataPersister;
use Symfony\Component\Serializer\Attribute\Groups;

/**
 * Entité polymorphique pour les commentaires sur différents types d'entités (Group, Walk, Dog, etc.)
 */
#[ApiFilter(SearchFilter::class, properties: ['commentedType' => 'exact', 'commentedId' => 'exact'])]
#[ORM\Entity(repositoryClass: CommentRepository::class)]
#[ORM\Index(columns: ['commented_type', 'commented_id'], name: 'idx_commented')]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['comment:read']]
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['comment:read']]
        ),
        new Post(
            processor: CommentDataPersister::class,
            denormalizationContext: ['groups' => ['comment:write']],
            normalizationContext: ['groups' => ['comment:read']],
            security: "is_granted('ROLE_USER')"
        )
    ]
)]
class Comment
{
    public const TYPE_GROUP = 'group';
    public const TYPE_WALK = 'walk';
    public const TYPE_DOG = 'dog';
    public const TYPE_USER = 'user';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['comment:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['comment:read', 'comment:write'])]
    private ?User $user = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Groups(['comment:read', 'comment:write'])]
    private ?string $content = null;

    /**
     * Le type d'entité commentée (group, walk, dog, user, etc.)
     */
    #[ORM\Column(length: 50)]
    #[Groups(['comment:read', 'comment:write'])]
    private ?string $commentedType = null;

    /**
     * L'ID de l'entité commentée
     */
    #[ORM\Column]
    #[Groups(['comment:read', 'comment:write'])]
    private ?int $commentedId = null;

    #[ORM\Column]
    #[Groups(['comment:read'])]
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

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCommentedType(): ?string
    {
        return $this->commentedType;
    }

    public function setCommentedType(string $commentedType): static
    {
        $this->commentedType = $commentedType;

        return $this;
    }

    public function getCommentedId(): ?int
    {
        return $this->commentedId;
    }

    public function setCommentedId(int $commentedId): static
    {
        $this->commentedId = $commentedId;

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

    /**
     * Méthode helper pour créer un commentaire sur un groupe
     * @deprecated Utiliser setCommentedType et setCommentedId à la place
     */
    public function setGroup(?Group $group): static
    {
        if ($group) {
            $this->commentedType = self::TYPE_GROUP;
            $this->commentedId = $group->getId();
        }
        return $this;
    }

    /**
     * @deprecated Utiliser getCommentedType et getCommentedId à la place
     */
    public function getGroup(): ?Group
    {
        return null; // Cette méthode est obsolète
    }
}
