<?php

namespace App\Entity;


use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use App\DataPersister\GroupDataPersister;
use App\Repository\GroupRepository;
use DateTimeImmutable;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use ApiPlatform\Metadata\Operation;

#[ORM\Entity(repositoryClass: GroupRepository::class)]
#[ORM\Table(name: '`group`')]
#[ApiResource(
    operations: [
        new Get(
            normalizationContext: ['groups' => ['group:details']],
            security: "is_granted('PUBLIC_ACCESS')"
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['group:details']],
            security: "is_granted('PUBLIC_ACCESS')"
        ),
        new Post(
            denormalizationContext: ['groups' => ['group:write']],
            security: "is_granted('ROLE_USER')",
            processor: GroupDataPersister::class,
            securityMessage: "Seuls les utilisateurs connectés peuvent créer des groupes"
        ),
        new Patch(
            denormalizationContext: ['groups' => ['group:write']],
            security: "is_granted('GROUP_EDIT', object)",
            securityMessage: "Vous ne pouvez modifier que vos propres groupes"
        ),
        new Delete(
            security: "is_granted('GROUP_DELETE', object)",
            securityMessage: "Vous ne pouvez supprimer que vos propres groupes"
        ),
        new Get(
            name: 'get_group_with_reviews',
            uriTemplate: '/groups-reviews',
            normalizationContext: ['groups' => ['group:reviews_only']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous n'avez pas les droits pour accéder à cette ressource"
        ),
    ]
)]
class Group
{
    /**
     * Le créateur du groupe
     */
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'createdGroups')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['group:details', 'group:read', 'me:read'])]
    private ?User $creator = null;

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(?User $creator): static
    {
        $this->creator = $creator;
        return $this;
    }
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['group:read', 'groupeRole:read', 'groupRequest:read', 'groupRequest:readAll', 'group:reviews_only', 'group:details'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['group:read', 'group:details', 'group:write'])]
    private ?bool $mixed = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['group:read', 'group:write', 'group:details'])]
    private ?string $comment = null;

    #[ORM\Column]
    #[Groups(['group:details'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['group:details'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $deletedAt = null;

    #[ORM\Column(length: 255)]
    #[Groups(['group:read', 'group:write', 'group:details', 'groupeRole:read', 'groupRequest:read', 'groupRequest:readAll', 'group:reviews_only', 'me:read'])]
    private ?string $name = null;

    /**
     * @var Collection<int, GroupMembership>
     * Membres et demandes d'adhésion au groupe (remplace groupRoles et groupRequests)
     */
    #[ORM\OneToMany(targetEntity: GroupMembership::class, mappedBy: 'walkGroup', orphanRemoval: true)]
    #[Groups(['group:read', 'group:details', 'me:read'])]
    private Collection $memberships;

    /**
     * @var Collection<int, Walk>
     */
    #[ORM\OneToMany(targetEntity: Walk::class, mappedBy: 'walkGroup', orphanRemoval: true)]
    #[Groups(['group:details', 'me:read'])]
    private Collection $walks;

    /**
     * @var Collection<int, Review>
     */
    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'walkGroup', orphanRemoval: true)]
    #[Groups(['group:details', 'me:read'])]
    private Collection $reviews;

    /**
     * @var Collection<int, Keywordable>
     * Les associations de keywords pour ce groupe (via table polymorphique)
     * Note: Relation polymorphique - pas de mappedBy, gérée manuellement via KeywordService
     */
    private Collection $keywordables;

    /**
     * Liste des keywords sérialisée pour l'API (non persistée en base)
     * @var Keyword[]|null
     */
    #[Groups(['group:read', 'group:write', 'group:details'])]
    private ?array $keywords = null;


    public function __construct(DateTimeImmutable $createdAt = new DateTimeImmutable(), DateTimeImmutable $updatedAt = new DateTimeImmutable())
    {
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->memberships = new ArrayCollection();
        $this->walks = new ArrayCollection();
        $this->reviews = new ArrayCollection();
        $this->keywordables = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function isMixed(): ?bool
    {
        return $this->mixed;
    }

    public function setMixed(bool $mixed): static
    {
        $this->mixed = $mixed;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(string $comment): static
    {
        $this->comment = $comment;

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

    public function getDeletedAt(): ?\DateTimeImmutable
    {
        return $this->deletedAt;
    }

    public function setDeletedAt(?\DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;

        return $this;
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

    /**
     * @return Collection<int, GroupMembership>
     */
    public function getMemberships(): Collection
    {
        return $this->memberships;
    }

    public function addMembership(GroupMembership $membership): static
    {
        if (!$this->memberships->contains($membership)) {
            $this->memberships->add($membership);
            $membership->setWalkGroup($this);
        }

        return $this;
    }

    public function removeMembership(GroupMembership $membership): static
    {
        if ($this->memberships->removeElement($membership)) {
            if ($membership->getWalkGroup() === $this) {
                $membership->setWalkGroup(null);
            }
        }

        return $this;
    }

    /**
     * Récupère les membres actifs du groupe
     * @return GroupMembership[]
     */
    public function getActiveMembers(): array
    {
        return $this->memberships->filter(
            fn(GroupMembership $m) => $m->isActive()
        )->toArray();
    }

    /**
     * Récupère les demandes en attente
     * @return GroupMembership[]
     */
    public function getPendingRequests(): array
    {
        return $this->memberships->filter(
            fn(GroupMembership $m) => $m->getStatus() === GroupMembership::STATUS_REQUESTED
        )->toArray();
    }

    /**
     * @return Collection<int, Walk>
     */
    public function getWalks(): Collection
    {
        return $this->walks;
    }

    public function addWalk(Walk $walk): static
    {
        if (!$this->walks->contains($walk)) {
            $this->walks->add($walk);
            $walk->setWalkGroup($this);
        }

        return $this;
    }

    public function removeWalk(Walk $walk): static
    {
        if ($this->walks->removeElement($walk)) {
            // set the owning side to null (unless already changed)
            if ($walk->getWalkGroup() === $this) {
                $walk->setWalkGroup(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Review>
     */
    public function getReviews(): Collection
    {
        return $this->reviews;
    }

    public function addReview(Review $review): static
    {
        if (!$this->reviews->contains($review)) {
            $this->reviews->add($review);
            $review->setWalkGroup($this);
        }

        return $this;
    }

    public function removeReview(Review $review): static
    {
        if ($this->reviews->removeElement($review)) {
            // set the owning side to null (unless already changed)
            if ($review->getWalkGroup() === $this) {
                $review->setWalkGroup(null);
            }
        }

        return $this;
    }

    /**
     * Récupère les keywords (à utiliser avec KeywordService pour les charger)
     * 
     * @return Keyword[]|null
     */
    public function getKeywords(): ?array
    {
        return $this->keywords;
    }

    /**
     * Définit les keywords (utilisé par le serializer et les data persisters)
     * 
     * @param Keyword[]|null $keywords
     */
    public function setKeywords(?array $keywords): static
    {
        $this->keywords = $keywords;

        return $this;
    }

    /**
     * @return Collection<int, Keywordable>
     */
    public function getKeywordables(): Collection
    {
        return $this->keywordables;
    }

    /**
     * Retourne le type pour les associations polymorphiques
     */
    public static function getKeywordableType(): string
    {
        return Keywordable::TYPE_GROUP;
    }
}
