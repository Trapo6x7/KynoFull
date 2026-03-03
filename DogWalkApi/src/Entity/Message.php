<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\DataPersister\MessageDataPersister;
use App\Repository\MessageRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ORM\Table(name: 'message')]
#[ORM\Index(columns: ['conversation_id'], name: 'IDX_CONVERSATION')]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['message:read']],
            security: "is_granted('ROLE_USER')",
        ),
        new Post(
            denormalizationContext: ['groups' => ['message:write']],
            normalizationContext: ['groups' => ['message:read']],
            security: "is_granted('ROLE_USER')",
            processor: MessageDataPersister::class,
        ),
        new Patch(
            uriTemplate: '/messages/{id}/read',
            denormalizationContext: ['groups' => ['message:read_patch']],
            normalizationContext: ['groups' => ['message:read']],
            security: "is_granted('ROLE_USER')",
        ),
    ]
)]
#[ApiFilter(SearchFilter::class, properties: ['conversation' => 'exact'])]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Conversation::class, inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['message:read', 'message:write'])]
    private ?Conversation $conversation = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['message:read'])]
    private ?User $sender = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['message:read', 'message:write'])]
    private ?string $content = null;

    #[ORM\Column(options: ['default' => false])]
    #[Groups(['message:read', 'message:read_patch'])]
    private bool $isRead = false;

    #[ORM\Column]
    #[Groups(['message:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getConversation(): ?Conversation { return $this->conversation; }
    public function setConversation(?Conversation $conversation): static { $this->conversation = $conversation; return $this; }

    public function getSender(): ?User { return $this->sender; }
    public function setSender(?User $sender): static { $this->sender = $sender; return $this; }

    public function getContent(): ?string { return $this->content; }
    public function setContent(?string $content): static { $this->content = $content; return $this; }

    public function isRead(): bool { return $this->isRead; }
    public function setIsRead(bool $isRead): static { $this->isRead = $isRead; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
