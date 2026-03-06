<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\DataPersister\WalkCreateDataPersister;
use App\Repository\WalkRepository;
use App\Contract\CommentableInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: WalkRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/users/me/spots',
            normalizationContext: ['groups' => ['walk:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['walk:read']],
            security: "is_granted('WALK_VIEW', object)"
        ),
        new Post(
            denormalizationContext: ['groups' => ['walk:write']],
            security: "is_granted('ROLE_USER')",
            processor: WalkCreateDataPersister::class
        ),
        new Patch(
            denormalizationContext: ['groups' => ['walk:patch']],
            security: "is_granted('WALK_EDIT', object)"
        ),
        new Delete(
            security: "is_granted('WALK_DELETE', object)"
        )
    ]
)]
class Walk implements CommentableInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['walk:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['walk:read', 'walk:write', 'walk:patch', 'me:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    #[Groups(['walk:read', 'walk:write', 'walk:patch'])]
    private ?string $location = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['walk:read', 'walk:write', 'walk:patch'])]
    private ?\DateTimeImmutable $startAt = null;



    /** OSM element ID — used to link a Walk record to a map spot. */
    #[ORM\Column(nullable: true)]
    #[Groups(['walk:read', 'walk:write'])]
    private ?int $osmId = null;

    /** User rating for the linked OSM spot (1-5). */
    #[ORM\Column(nullable: true)]
    #[Assert\Range(min: 1, max: 5)]
    #[Groups(['walk:read', 'walk:write'])]
    private ?int $rating = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['walk:read'])]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getStartAt(): ?\DateTimeImmutable
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTimeImmutable $startAt): static
    {
        $this->startAt = $startAt;

        return $this;
    }



    public function getOsmId(): ?int
    {
        return $this->osmId;
    }

    public function setOsmId(?int $osmId): static
    {
        $this->osmId = $osmId;

        return $this;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(?int $rating): static
    {
        $this->rating = $rating;

        return $this;
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

    /**
     * Implémentation de CommentableInterface (SOLID - OCP).
     */
    public function getCommentableType(): string
    {
        return 'walk';
    }
}
