<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\GetCollection;
use App\DataPersister\UserDataPersister;
use App\Repository\UserRepository;
use DateTimeImmutable;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use App\DataPersister\UserPasswordChangeDataPersister;
use App\DataPersister\UserUpdateDataPersister;
use App\State\Provider\MeProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Annotation\SerializedName;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Dto\UserPasswordUpdateDto;
use App\Contract\CommentableInterface;
use App\Contract\KeywordableInterface;
use App\DataPersister\UserImageUploadDataPersister;


#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/register',
            denormalizationContext: ['groups' => ['user:write']],
            validationContext: ['groups' => ['Default']],
            security: "is_granted('PUBLIC_ACCESS')",
            processor: UserDataPersister::class
        ),
        new Get(
            uriTemplate: '/me',
            normalizationContext: ['groups' => ['me:read']],
            security: "is_granted('ROLE_USER')",
            provider: MeProvider::class
        ),
        new GetCollection(
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_USER')"
        ),
        new Get(
            normalizationContext: ['groups' => ['user:read']],
            // security: "is_granted('ROLE_ADMIN')"
        ),
        new Delete(
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous ne pouvez supprimer que votre propre compte",
        ),
        new Patch(
            denormalizationContext: ['groups' => ['user:patch']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous ne pouvez modifier que vos propres informations",
            processor: UserUpdateDataPersister::class
        ),
        new Post(
            uriTemplate: '/users/updatepassword',
            input: UserPasswordUpdateDto::class,
            denormalizationContext: ['groups' => ['pass:patch']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous ne pouvez modifier que vos propres informations",
            processor: UserPasswordChangeDataPersister::class
        ),
        new Post(
            name: 'user_image_post',
            uriTemplate: '/users/image',
            denormalizationContext: ['groups' => ['user:image']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous ne pouvez uploader une image que pour votre propre compte",
            validationContext: ['groups' => ['Default']],
            deserialize: false,
            processor: UserImageUploadDataPersister::class
        ),
    ]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface, CommentableInterface, KeywordableInterface
{
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['me:read', 'user:read'])]
    private bool $is_complete = false;

    public function isComplete(): bool
    {
        return $this->is_complete;
    }

    #[Groups(['me:read', 'user:read'])]
    #[SerializedName('is_complete')]
    public function getIsCompleteForSerialization(): bool
    {
        return $this->is_complete;
    }

    public function setIsComplete(bool $is_complete): static
    {
        $this->is_complete = $is_complete;
        return $this;
    }

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['groupeRole:read', 'groupRequest:read', 'groupRequest:readAll', 'me:read', 'user:read', 'user:id', 'group:details', 'comment:read', 'conversation:read', 'message:read'])]
    private ?int $id = null;

    #[Assert\NotBlank]
    #[Assert\Email]
    #[ORM\Column(length: 180)]
    #[Groups(['user:write', 'me:read'])]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[Assert\NotBlank]
    #[Assert\Length(min: 6)]
    #[ORM\Column]
    #[Groups(['user:write', 'pass:patch'])]
    private ?string $password = null;

    #[Assert\NotBlank]
    #[Assert\Length(min: 3)]
    #[ORM\Column(length: 255)]
    #[Groups(['user:write', 'me:read', 'user:read', 'user:patch', 'group:details', 'groupeRole:read', 'groupRequest:read', 'groupRequest:readAll', 'comment:read', 'conversation:read', 'message:read'])]
    private ?string $name = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['user:write', 'me:read', 'user:read', 'user:patch'])]
    private ?string $gender = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:write', 'me:read', 'user:read', 'user:patch'])]
    private ?string $profession = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['user:write', 'me:read', 'user:read', 'user:patch'])]
    private ?string $description = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 8, nullable: true)]
    #[Groups(['user:write', 'me:read', 'user:read', 'user:patch'])]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 11, scale: 8, nullable: true)]
    #[Groups(['user:write', 'me:read', 'user:read', 'user:patch'])]
    private ?string $longitude = null;

    #[Assert\NotNull]
    #[Assert\LessThan('-18 years')]
    #[ORM\Column]
    #[Groups(['user:write', 'me:read', 'user:read'])]
    private ?\DateTimeImmutable $birthdate = null;

    #[ORM\Column]
    #[Groups(['me:read', 'user:read'])]
    private ?bool $isVerified = false;

    #[Groups(['me:read', 'user:read'])]
    #[SerializedName('isVerified')]
    public function getIsVerifiedForSerialization(): bool
    {
        return $this->isVerified ?? false;
    }

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $verificationCode = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $verificationCodeExpiresAt = null;

    #[ORM\Column]
    #[Groups(['me:read'])]
    private ?int $score = 0;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt;

    #[ORM\Column]
    private ?\DateTimeImmutable $updatedAt;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $deletedAt;

    #[ORM\Column(type: 'json', nullable: true)]
    #[Groups(['user:write', 'user:image', 'me:read', 'user:read', 'conversation:read', 'message:read'])]
    private ?array $images = null;

    #[Groups(['user:write', 'me:read'])]
    public ?UploadedFile $file = null;

    /**
     * @var Collection<int, Dog>
     */
    #[ORM\OneToMany(targetEntity: Dog::class, mappedBy: 'user', orphanRemoval: true)]
    #[Groups(['me:read', 'user:read'])]
    private Collection $dogs;

    /**
     * @var Collection<int, UserModeration>
     * Actions de modération (blocks + reports) effectuées par cet utilisateur
     */
    #[ORM\OneToMany(targetEntity: UserModeration::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $moderations;

    #[Groups(['pass:patch'])]
    private ?string $oldPassword = null;

    #[Assert\Length(min: 2)]
    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:write', 'me:read', 'user:patch'])]
    private ?string $city = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    #[Groups(['me:read', 'user:patch'])]
    private bool $privateMode = false;

    // ─── Filtres de match ──────────────────────────────────────────────────────

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['me:read', 'user:patch'])]
    private ?string $filterGender = null;

    #[ORM\Column(type: Types::SMALLINT, nullable: true, options: ['default' => 50])]
    #[Groups(['me:read', 'user:patch'])]
    private ?int $filterDistanceKm = 50;

    #[ORM\Column(type: Types::SMALLINT, nullable: true, options: ['default' => 18])]
    #[Groups(['me:read', 'user:patch'])]
    private ?int $filterAgeMin = 18;

    #[ORM\Column(type: Types::SMALLINT, nullable: true, options: ['default' => 80])]
    #[Groups(['me:read', 'user:patch'])]
    private ?int $filterAgeMax = 80;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['me:read', 'user:patch'])]
    private ?string $filterDogGender = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['me:read', 'user:patch'])]
    private ?string $filterDogSize = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: 'filter_race_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    #[Groups(['me:read', 'user:patch'])]
    private ?Race $filterRace = null;

    /**
     * @var Collection<int, Keywordable>
     * Les associations de keywords pour cet utilisateur (via table polymorphique)
     * Note: Relation polymorphique - pas de mappedBy, gérée manuellement via KeywordService
     */
    private Collection $keywordables;

    /**
     * Liste des keywords sérialisée pour l'API (non persistée en base)
     * Contient les noms des keywords sous forme de strings
     * @var string[]|null
     */
    #[Groups(['me:read', 'user:read'])]
    private ?array $keywords = null;

    public function __construct(DateTimeImmutable $createdAt = new DateTimeImmutable(), DateTimeImmutable $updatedAt = new DateTimeImmutable())
    {
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
        $this->dogs = new ArrayCollection();
        $this->moderations = new ArrayCollection();
        $this->keywordables = new ArrayCollection();
        $this->images = [];
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     * @return list<string>
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
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



    public function getBirthdate(): ?\DateTimeImmutable
    {
        return $this->birthdate;
    }

    public function setBirthdate(\DateTimeImmutable $birthdate): static
    {
        $this->birthdate = $birthdate;

        return $this;
    }

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }

    public function getVerificationCode(): ?string
    {
        return $this->verificationCode;
    }

    public function setVerificationCode(?string $verificationCode): static
    {
        $this->verificationCode = $verificationCode;

        return $this;
    }

    public function getVerificationCodeExpiresAt(): ?\DateTimeImmutable
    {
        return $this->verificationCodeExpiresAt;
    }

    public function setVerificationCodeExpiresAt(?\DateTimeImmutable $verificationCodeExpiresAt): static
    {
        $this->verificationCodeExpiresAt = $verificationCodeExpiresAt;

        return $this;
    }

    public function isVerificationCodeValid(): bool
    {
        if (!$this->verificationCode || !$this->verificationCodeExpiresAt) {
            return false;
        }

        return $this->verificationCodeExpiresAt > new \DateTimeImmutable();
    }

    public function getScore(): ?int
    {
        return $this->score;
    }

    public function setScore(int $score): static
    {
        $this->score = $score;

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

    public function setDeletedAt(\DateTimeImmutable $deletedAt): static
    {
        $this->deletedAt = $deletedAt;

        return $this;
    }

    public function getImages(): ?array
    {
        return $this->images;
    }

    public function setImages(?array $images): static
    {
        $this->images = $images;
        return $this;
    }

    #[Groups(['me:read', 'user:read'])]
    #[SerializedName('images')]
    public function getImagesForSerialization(): array
    {
        return $this->images ?? [];
    }

    /**
     * @return Collection<int, Dog>
     */
    public function getDogs(): Collection
    {
        return $this->dogs;
    }

    public function addDog(Dog $dog): static
    {
        if (!$this->dogs->contains($dog)) {
            $this->dogs->add($dog);
            $dog->setUser($this);
        }

        return $this;
    }

    public function removeDog(Dog $dog): static
    {
        if ($this->dogs->removeElement($dog)) {
            // set the owning side to null (unless already changed)
            if ($dog->getUser() === $this) {
                $dog->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, UserModeration>
     */
    public function getModerations(): Collection
    {
        return $this->moderations;
    }

    public function addModeration(UserModeration $moderation): static
    {
        if (!$this->moderations->contains($moderation)) {
            $this->moderations->add($moderation);
            $moderation->setUser($this);
        }

        return $this;
    }

    public function removeModeration(UserModeration $moderation): static
    {
        if ($this->moderations->removeElement($moderation)) {
            if ($moderation->getUser() === $this) {
                $moderation->setUser(null);
            }
        }

        return $this;
    }

    /**
     * Récupère uniquement les blocages
     * @return UserModeration[]
     */
    public function getBlocks(): array
    {
        return $this->moderations->filter(
            fn(UserModeration $m) => $m->isBlock()
        )->toArray();
    }

    /**
     * Récupère uniquement les signalements
     * @return UserModeration[]
     */
    public function getReports(): array
    {
        return $this->moderations->filter(
            fn(UserModeration $m) => $m->isReport()
        )->toArray();
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getGender(): ?string
    {
        return $this->gender;
    }

    public function setGender(?string $gender): static
    {
        $this->gender = $gender;
        return $this;
    }

    public function getProfession(): ?string
    {
        return $this->profession;
    }

    public function setProfession(?string $profession): static
    {
        $this->profession = $profession;
        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(?string $latitude): static
    {
        $this->latitude = $latitude;
        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(?string $longitude): static
    {
        $this->longitude = $longitude;
        return $this;
    }

    public function getOldPassword(): ?string
    {
        return $this->oldPassword;
    }

    public function setOldPassword(string $oldPassword): static
    {
        $this->oldPassword = $oldPassword;

        return $this;
    }

    public function getCity(): ?string
    {
        return $this->city;
    }

    public function setCity(string $city): static
    {
        $this->city = $city;

        return $this;
    }

    public function isPrivateMode(): bool
    {
        return $this->privateMode;
    }

    public function setPrivateMode(bool $privateMode): static
    {
        $this->privateMode = $privateMode;

        return $this;
    }

    /**
     * Récupère les keywords (chargés automatiquement par KeywordableNormalizer)
     * 
     * @return string[]|null Tableau de noms de keywords
     */
    public function getKeywords(): ?array
    {
        return $this->keywords;
    }

    /**
     * Définit les keywords (utilisé par le serializer et les data persisters)
     * 
     * @param string[]|null $keywords Tableau de noms de keywords
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
        return Keywordable::TYPE_USER;
    }

    /**
     * Implémentation de CommentableInterface (SOLID - OCP).
     */
    public function getCommentableType(): string
    {
        return 'user';
    }

    // ─── Getters/Setters filtres de match ──────────────────────────────────────

    public function getFilterGender(): ?string { return $this->filterGender; }
    public function setFilterGender(?string $filterGender): static { $this->filterGender = $filterGender; return $this; }

    public function getFilterDistanceKm(): ?int { return $this->filterDistanceKm; }
    public function setFilterDistanceKm(?int $filterDistanceKm): static { $this->filterDistanceKm = $filterDistanceKm; return $this; }

    public function getFilterAgeMin(): ?int { return $this->filterAgeMin; }
    public function setFilterAgeMin(?int $filterAgeMin): static { $this->filterAgeMin = $filterAgeMin; return $this; }

    public function getFilterAgeMax(): ?int { return $this->filterAgeMax; }
    public function setFilterAgeMax(?int $filterAgeMax): static { $this->filterAgeMax = $filterAgeMax; return $this; }

    public function getFilterDogGender(): ?string { return $this->filterDogGender; }
    public function setFilterDogGender(?string $filterDogGender): static { $this->filterDogGender = $filterDogGender; return $this; }

    public function getFilterDogSize(): ?string { return $this->filterDogSize; }
    public function setFilterDogSize(?string $filterDogSize): static { $this->filterDogSize = $filterDogSize; return $this; }

    public function getFilterRace(): ?Race { return $this->filterRace; }
    public function setFilterRace(?Race $filterRace): static { $this->filterRace = $filterRace; return $this; }
}
