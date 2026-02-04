<?php

namespace App\Entity;

use App\Repository\KeywordableRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Table d'association polymorphique pour relier les keywords à n'importe quelle entité (User, Dog, Group, etc.)
 */
#[ORM\Entity(repositoryClass: KeywordableRepository::class)]
#[ORM\Table(name: 'keywordables')]
#[ORM\Index(columns: ['keywordable_type', 'keywordable_id'], name: 'idx_keywordable')]
#[ORM\UniqueConstraint(name: 'unique_keyword_relation', columns: ['keyword_id', 'keywordable_type', 'keywordable_id'])]
class Keywordable
{
    public const TYPE_USER = 'user';
    public const TYPE_DOG = 'dog';
    public const TYPE_GROUP = 'group';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Keyword::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?Keyword $keyword = null;

    /**
     * Le type d'entité associée (user, dog, group, etc.)
     */
    #[ORM\Column(length: 50)]
    private ?string $keywordableType = null;

    /**
     * L'ID de l'entité associée
     */
    #[ORM\Column]
    private ?int $keywordableId = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getKeyword(): ?Keyword
    {
        return $this->keyword;
    }

    public function setKeyword(?Keyword $keyword): static
    {
        $this->keyword = $keyword;

        return $this;
    }

    public function getKeywordableType(): ?string
    {
        return $this->keywordableType;
    }

    public function setKeywordableType(string $keywordableType): static
    {
        $this->keywordableType = $keywordableType;

        return $this;
    }

    public function getKeywordableId(): ?int
    {
        return $this->keywordableId;
    }

    public function setKeywordableId(int $keywordableId): static
    {
        $this->keywordableId = $keywordableId;

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
}
