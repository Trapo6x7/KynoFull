<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour créer la table user_match (likes/dislikes avec score de matching)
 */
final class Version20260206120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Crée la table user_match pour gérer les likes/dislikes et le matching';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE user_match (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            target_user_id INT NOT NULL,
            action VARCHAR(20) NOT NULL COMMENT "like, dislike",
            match_score DECIMAL(5, 2) DEFAULT NULL COMMENT "Score de compatibilité (0-100)",
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            INDEX IDX_USER (user_id),
            INDEX IDX_TARGET (target_user_id),
            INDEX IDX_ACTION (action),
            UNIQUE INDEX unique_user_target (user_id, target_user_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE user_match ADD CONSTRAINT FK_MATCH_USER FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_match ADD CONSTRAINT FK_MATCH_TARGET FOREIGN KEY (target_user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user_match DROP FOREIGN KEY FK_MATCH_USER');
        $this->addSql('ALTER TABLE user_match DROP FOREIGN KEY FK_MATCH_TARGET');
        $this->addSql('DROP TABLE user_match');
    }
}
