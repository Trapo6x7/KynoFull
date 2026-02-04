<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\DataPersister\WalkDataPersister;
use App\Repository\WalkRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: WalkRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/groups/{id}/walks',
            normalizationContext: ['groups' => ['walk:read']],
            security: "is_granted('GROUP_VIEW', object)",
            securityMessage: "Seuls les membres du groupe peuvent voir les balades"
        ),
        new Get(
            normalizationContext: ['groups' => ['walk:read']],
            security: "is_granted('WALK_VIEW', object)",
            securityMessage: "Seuls les membres du groupe peuvent voir la promenade",
        ),
        new Post(
            denormalizationContext: ['groups' => ['walk:write']],
            security: "is_granted('WALK_CREATE')",
            securityMessage: "Seuls les membres du groupe peuvent créer une promenade",
            processor: WalkDataPersister::class
        ),
        new Patch(
            denormalizationContext: ['groups' => ['walk:patch']],
            security: "is_granted('WALK_EDIT', object)",
            securityMessage: "Seuls les membres du groupe peuvent modifier la promenade"
        ),
        new Delete(
            security: "is_granted('WALK_DELETE', object)",
            securityMessage: "Seuls les membres du groupe peuvent supprimer la promenade"
        )
    ]
)]
class Walk
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

    #[ORM\Column]
    #[Groups(['walk:read', 'walk:write', 'walk:patch'])]
    private ?\DateTimeImmutable $startAt = null;

    #[ORM\ManyToOne(inversedBy: 'walks')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['walk:read', 'walk:write', 'walk:patch', 'me:read'])]
    private ?Group $walkGroup = null;

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

    public function getWalkGroup(): ?Group
    {
        return $this->walkGroup;
    }

    public function setWalkGroup(?Group $walkGroup): static
    {
        $this->walkGroup = $walkGroup;

        return $this;
    }

}
