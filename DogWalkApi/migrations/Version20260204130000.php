<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour fusionner block_list et report en user_moderation
 */
final class Version20260204130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Fusionne block_list et report en une seule table polymorphique user_moderation';
    }

    public function up(Schema $schema): void
    {
        // Créer la nouvelle table user_moderation
        $this->addSql('CREATE TABLE IF NOT EXISTS user_moderation (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            action_type VARCHAR(50) NOT NULL,
            target_type VARCHAR(50) NOT NULL,
            target_id INT NOT NULL,
            comment LONGTEXT DEFAULT NULL,
            status VARCHAR(50) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            resolved_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_A76ED395 (user_id),
            INDEX idx_action_type (action_type),
            INDEX idx_target (target_type, target_id),
            INDEX idx_status (status),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajouter la clé étrangère
        $this->addSql('ALTER TABLE user_moderation ADD CONSTRAINT FK_MODERATION_USER FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');

        // Migrer les données de block_list (action = block, target = user)
        $this->addSql('INSERT INTO user_moderation (user_id, action_type, target_type, target_id, status, created_at)
            SELECT blocker_id, \'block\', \'user\', blocked_id, NULL, created_at
            FROM block_list');

        // Migrer les données de report (action = report, target = user)
        // Le champ 'comment' de la table report n'existe pas encore, on le laisse NULL
        $this->addSql('INSERT INTO user_moderation (user_id, action_type, target_type, target_id, status, created_at)
            SELECT reporter_id, \'report\', \'user\', reported_id, 
                CASE 
                    WHEN statut = 1 THEN \'resolved\'
                    ELSE \'pending\'
                END,
                created_at
            FROM report');

        // Supprimer les anciennes tables
        // Vérifier d'abord les noms des clés étrangères
        $this->addSql('SET FOREIGN_KEY_CHECKS = 0');
        $this->addSql('DROP TABLE IF EXISTS block_list');
        $this->addSql('DROP TABLE IF EXISTS report');
        $this->addSql('SET FOREIGN_KEY_CHECKS = 1');
    }

    public function down(Schema $schema): void
    {
        // Recréer block_list
        $this->addSql('CREATE TABLE block_list (
            id INT AUTO_INCREMENT NOT NULL,
            blocker_id INT NOT NULL,
            blocked_id INT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_BLOCKER (blocker_id),
            INDEX IDX_BLOCKED (blocked_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recréer report
        $this->addSql('CREATE TABLE report (
            id INT AUTO_INCREMENT NOT NULL,
            reporter_id INT NOT NULL,
            reported_id INT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            statut TINYINT(1) NOT NULL,
            INDEX IDX_REPORTER (reporter_id),
            INDEX IDX_REPORTED (reported_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajouter les clés étrangères
        $this->addSql('ALTER TABLE block_list ADD CONSTRAINT FK_BLOCKLIST_BLOCKER FOREIGN KEY (blocker_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE block_list ADD CONSTRAINT FK_BLOCKLIST_BLOCKED FOREIGN KEY (blocked_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_REPORT_REPORTER FOREIGN KEY (reporter_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_REPORT_REPORTED FOREIGN KEY (reported_id) REFERENCES user (id)');

        // Migrer les blocks vers block_list
        $this->addSql('INSERT INTO block_list (blocker_id, blocked_id, created_at)
            SELECT user_id, target_id, created_at
            FROM user_moderation
            WHERE action_type = \'block\' AND target_type = \'user\'');

        // Migrer les reports vers report
        $this->addSql('INSERT INTO report (reporter_id, reported_id, statut, created_at)
            SELECT user_id, target_id, 
                CASE 
                    WHEN status = \'resolved\' THEN 1
                    ELSE 0
                END,
                created_at
            FROM user_moderation
            WHERE action_type = \'report\' AND target_type = \'user\'');

        // Supprimer user_moderation
        $this->addSql('ALTER TABLE user_moderation DROP FOREIGN KEY FK_MODERATION_USER');
        $this->addSql('DROP TABLE user_moderation');
    }
}
