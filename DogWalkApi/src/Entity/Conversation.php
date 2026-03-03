<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\DataPersister\ConversationDataPersister;
use App\Repository\ConversationRepository;
use App\State\Provider\ConversationCollectionProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: ConversationRepository::class)]
#[ORM\Table(name: 'conversation')]
#[ORM\UniqueConstraint(name: 'unique_conversation', columns: ['participant1_id', 'participant2_id'])]
#[ORM\UniqueConstraint(name: 'unique_group_conversation', columns: ['group_id'])]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['conversation:read']],
            security: "is_granted('ROLE_USER')",
            provider: ConversationCollectionProvider::class,
        ),
        new Get(
            normalizationContext: ['groups' => ['conversation:read']],
            security: "is_granted('ROLE_USER')",
        ),
        new Post(
            denormalizationContext: ['groups' => ['conversation:write']],
            normalizationContext: ['groups' => ['conversation:read']],
            security: "is_granted('ROLE_USER')",
            processor: ConversationDataPersister::class,
        ),
    ]
)]
class Conversation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?int $id = null;

    /** 'private' | 'group' */
    #[ORM\Column(length: 20, options: ['default' => 'private'])]
    #[Groups(['conversation:read'])]
    private string $type = 'private';

    /** Renseigné uniquement pour les conversations de groupe */
    #[ORM\ManyToOne(targetEntity: Group::class)]
    #[ORM\JoinColumn(name: 'group_id', nullable: true, onDelete: 'CASCADE')]
    #[Groups(['conversation:read'])]
    private ?Group $group = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    #[Groups(['conversation:read'])]
    private ?User $participant1 = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    #[Groups(['conversation:read'])]
    private ?User $participant2 = null;

    /** Dénormalisé : contenu du dernier message (évite le N+1 sur la liste) */
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['conversation:read'])]
    private ?string $lastMessageContent = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['conversation:read'])]
    private ?\DateTimeImmutable $lastMessageAt = null;

    /** Messages non lus pour participant1 */
    #[ORM\Column(options: ['default' => 0])]
    #[Groups(['conversation:read'])]
    private int $unreadCount1 = 0;

    /** Messages non lus pour participant2 */
    #[ORM\Column(options: ['default' => 0])]
    #[Groups(['conversation:read'])]
    private int $unreadCount2 = 0;

    #[ORM\Column]
    #[Groups(['conversation:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    /** @var Collection<int, Message> */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'conversation', orphanRemoval: true, cascade: ['persist'])]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    private Collection $messages;

    /** ID de l'autre participant (conversation privée) */
    #[Groups(['conversation:write'])]
    private ?int $otherUserId = null;

    /** ID du groupe (conversation de groupe) */
    #[Groups(['conversation:write'])]
    private ?int $groupId = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->messages  = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getParticipant1(): ?User { return $this->participant1; }
    public function setParticipant1(?User $participant1): static { $this->participant1 = $participant1; return $this; }

    public function getParticipant2(): ?User { return $this->participant2; }
    public function setParticipant2(?User $participant2): static { $this->participant2 = $participant2; return $this; }

    public function getLastMessageContent(): ?string { return $this->lastMessageContent; }
    public function setLastMessageContent(?string $v): static { $this->lastMessageContent = $v; return $this; }

    public function getLastMessageAt(): ?\DateTimeImmutable { return $this->lastMessageAt; }
    public function setLastMessageAt(?\DateTimeImmutable $v): static { $this->lastMessageAt = $v; return $this; }

    public function getUnreadCount1(): int { return $this->unreadCount1; }
    public function setUnreadCount1(int $v): static { $this->unreadCount1 = $v; return $this; }

    public function getUnreadCount2(): int { return $this->unreadCount2; }
    public function setUnreadCount2(int $v): static { $this->unreadCount2 = $v; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    /** @return Collection<int, Message> */
    public function getMessages(): Collection { return $this->messages; }

    public function getOtherUserId(): ?int { return $this->otherUserId; }
    public function setOtherUserId(?int $v): static { $this->otherUserId = $v; return $this; }

    public function getGroupId(): ?int { return $this->groupId; }
    public function setGroupId(?int $v): static { $this->groupId = $v; return $this; }

    public function getType(): string { return $this->type; }
    public function setType(string $v): static { $this->type = $v; return $this; }

    public function getGroup(): ?Group { return $this->group; }
    public function setGroup(?Group $v): static { $this->group = $v; return $this; }

    public function isGroupConversation(): bool { return $this->type === 'group'; }

    /** Vérifie si $user est participant direct (mode private) */
    public function hasParticipant(User $user): bool
    {
        return $this->participant1?->getId() === $user->getId()
            || $this->participant2?->getId() === $user->getId();
    }

    /** Retourne l'autre participant par rapport à $user */
    public function getOtherParticipant(User $user): ?User
    {
        if ($this->participant1?->getId() === $user->getId()) {
            return $this->participant2;
        }
        return $this->participant1;
    }

    /** Retourne le nb de messages non lus pour $user */
    public function getUnreadCountFor(User $user): int
    {
        if ($this->participant1?->getId() === $user->getId()) {
            return $this->unreadCount1;
        }
        return $this->unreadCount2;
    }

    /** Incrémente le compteur non lu pour $user */
    public function incrementUnreadFor(User $user): void
    {
        if ($this->participant1?->getId() === $user->getId()) {
            $this->unreadCount1++;
        } else {
            $this->unreadCount2++;
        }
    }

    /** Remet à zéro le compteur non lu pour $user */
    public function resetUnreadFor(User $user): void
    {
        if ($this->participant1?->getId() === $user->getId()) {
            $this->unreadCount1 = 0;
        } else {
            $this->unreadCount2 = 0;
        }
    }
}
