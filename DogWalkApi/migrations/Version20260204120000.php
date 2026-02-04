<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour fusionner group_role et group_request en group_membership
 */
final class Version20260204120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fusionne group_role et group_request en une seule table group_membership avec status et role';
    }

    public function up(Schema $schema): void
    {
        // Créer la nouvelle table group_membership
        $this->addSql('CREATE TABLE IF NOT EXISTS group_membership (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            group_id INT NOT NULL,
            status VARCHAR(50) NOT NULL,
            role VARCHAR(50) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_5132B337A76ED395 (user_id),
            INDEX IDX_5132B337FE54D947 (group_id),
            INDEX idx_status (status),
            UNIQUE INDEX unique_user_group (user_id, group_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajouter les clés étrangères
        $this->addSql('ALTER TABLE group_membership ADD CONSTRAINT FK_5132B337A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE group_membership ADD CONSTRAINT FK_5132B337FE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id)');

        // Migrer les données de group_role (membres actifs)
        $this->addSql('INSERT INTO group_membership (user_id, group_id, status, role, created_at, updated_at)
            SELECT user_id, walk_group_id, \'active\', role, NOW(), NOW()
            FROM group_role');

        // Migrer les données de group_request (demandes en attente)
        // status = false signifie en attente (requested), status = true signifie déjà traité (on ignore)
        $this->addSql('INSERT INTO group_membership (user_id, group_id, status, role, created_at, updated_at)
            SELECT user_id, walk_group_id, \'requested\', \'MEMBER\', created_at, updated_at
            FROM group_request
            WHERE group_request.status = 0
            ON DUPLICATE KEY UPDATE group_membership.status = VALUES(status)'); // Évite les doublons si l'utilisateur existe déjà comme membre

        // Supprimer les anciennes tables
        $this->addSql('ALTER TABLE group_role DROP FOREIGN KEY FK_7E33D11AA76ED395');
        $this->addSql('ALTER TABLE group_role DROP FOREIGN KEY FK_7E33D11A3E506FC8');
        $this->addSql('DROP TABLE group_role');

        $this->addSql('ALTER TABLE group_request DROP FOREIGN KEY FK_BD97DB933E506FC8');
        $this->addSql('ALTER TABLE group_request DROP FOREIGN KEY FK_BD97DB93A76ED395');
        $this->addSql('DROP TABLE group_request');
    }

    public function down(Schema $schema): void
    {
        // Recréer group_role
        $this->addSql('CREATE TABLE group_role (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            walk_group_id INT NOT NULL,
            role VARCHAR(255) NOT NULL,
            INDEX IDX_8C12504FA76ED395 (user_id),
            INDEX IDX_8C12504F19209E8D (walk_group_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recréer group_request
        $this->addSql('CREATE TABLE group_request (
            id INT AUTO_INCREMENT NOT NULL,
            walk_group_id INT NOT NULL,
            user_id INT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            status TINYINT(1) NOT NULL DEFAULT 0,
            INDEX IDX_9D7D799919209E8D (walk_group_id),
            INDEX IDX_9D7D7999A76ED395 (user_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajouter les clés étrangères
        $this->addSql('ALTER TABLE group_role ADD CONSTRAINT FK_8C12504FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE group_role ADD CONSTRAINT FK_8C12504F19209E8D FOREIGN KEY (walk_group_id) REFERENCES `group` (id)');
        $this->addSql('ALTER TABLE group_request ADD CONSTRAINT FK_9D7D799919209E8D FOREIGN KEY (walk_group_id) REFERENCES `group` (id)');
        $this->addSql('ALTER TABLE group_request ADD CONSTRAINT FK_9D7D7999A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');

        // Migrer les données actives vers group_role
        $this->addSql('INSERT INTO group_role (user_id, walk_group_id, role)
            SELECT user_id, group_id, role
            FROM group_membership
            WHERE status = \'active\'');

        // Migrer les demandes en attente vers group_request
        $this->addSql('INSERT INTO group_request (user_id, walk_group_id, status, created_at, updated_at)
            SELECT user_id, group_id, 0, created_at, updated_at
            FROM group_membership
            WHERE status = \'requested\'');

        // Supprimer group_membership
        $this->addSql('ALTER TABLE group_membership DROP FOREIGN KEY FK_5132B337A76ED395');
        $this->addSql('ALTER TABLE group_membership DROP FOREIGN KEY FK_5132B337FE54D947');
        $this->addSql('DROP TABLE group_membership');
    }
}
