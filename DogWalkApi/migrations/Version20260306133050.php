<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260306133050 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE walk DROP FOREIGN KEY FK_8D917A553E506FC8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `group` DROP FOREIGN KEY FK_6DC044C561220EA6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_membership DROP FOREIGN KEY FK_5132B337A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_membership DROP FOREIGN KEY FK_5132B337FE54D947
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review DROP FOREIGN KEY FK_794381C63E506FC8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review DROP FOREIGN KEY FK_794381C6A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE `group`
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE group_membership
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE review
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation RENAME INDEX idx_8a8e26e9b0f4a9e5 TO IDX_8A8E26E9B29A9963
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation RENAME INDEX idx_8a8e26e9d0919a2a TO IDX_8A8E26E9A02F368D
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation RENAME INDEX uq_conversation_participants TO unique_conversation
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message RENAME INDEX idx_b6bd307f9ac0396 TO IDX_CONVERSATION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD filter_race_id INT DEFAULT NULL, ADD filter_gender VARCHAR(50) DEFAULT NULL, ADD filter_distance_km SMALLINT DEFAULT 50, ADD filter_age_min SMALLINT DEFAULT 18, ADD filter_age_max SMALLINT DEFAULT 80, ADD filter_dog_gender VARCHAR(50) DEFAULT NULL, ADD filter_dog_size VARCHAR(50) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD CONSTRAINT FK_8D93D649D9C9A368 FOREIGN KEY (filter_race_id) REFERENCES race (id) ON DELETE SET NULL
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8D93D649D9C9A368 ON user (filter_race_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match DROP FOREIGN KEY FK_MATCH_TARGET
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match DROP FOREIGN KEY FK_MATCH_USER
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match CHANGE action action VARCHAR(20) NOT NULL, CHANGE match_score match_score NUMERIC(5, 2) DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match ADD CONSTRAINT FK_98993E5DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match ADD CONSTRAINT FK_98993E5D6C066AFE FOREIGN KEY (target_user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match RENAME INDEX idx_user TO IDX_98993E5DA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match RENAME INDEX idx_target TO IDX_98993E5D6C066AFE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk DROP FOREIGN KEY FK_8D917731A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_8D917A553E506FC8 ON walk
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk DROP walk_group_id, CHANGE osm_id osm_id INT DEFAULT NULL, CHANGE rating rating INT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk ADD CONSTRAINT FK_8D917A55A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk RENAME INDEX idx_8d917731a76ed395 TO IDX_8D917A55A76ED395
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE `group` (id INT AUTO_INCREMENT NOT NULL, creator_id INT NOT NULL, mixed TINYINT(1) NOT NULL, comment VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', deleted_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', name VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_6DC044C561220EA6 (creator_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE group_membership (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, group_id INT NOT NULL, status VARCHAR(50) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, role VARCHAR(50) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_5132B337A76ED395 (user_id), INDEX IDX_5132B337FE54D947 (group_id), INDEX idx_status (status), UNIQUE INDEX unique_user_group (user_id, group_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE review (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, walk_group_id INT NOT NULL, rating INT NOT NULL, comment VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_794381C63E506FC8 (walk_group_id), INDEX IDX_794381C6A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = '' 
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `group` ADD CONSTRAINT FK_6DC044C561220EA6 FOREIGN KEY (creator_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_membership ADD CONSTRAINT FK_5132B337A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_membership ADD CONSTRAINT FK_5132B337FE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review ADD CONSTRAINT FK_794381C63E506FC8 FOREIGN KEY (walk_group_id) REFERENCES `group` (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review ADD CONSTRAINT FK_794381C6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation RENAME INDEX idx_8a8e26e9b29a9963 TO IDX_8A8E26E9B0F4A9E5
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation RENAME INDEX idx_8a8e26e9a02f368d TO IDX_8A8E26E9D0919A2A
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation RENAME INDEX unique_conversation TO uq_conversation_participants
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE message RENAME INDEX idx_conversation TO IDX_B6BD307F9AC0396
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP FOREIGN KEY FK_8D93D649D9C9A368
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_8D93D649D9C9A368 ON user
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP filter_race_id, DROP filter_gender, DROP filter_distance_km, DROP filter_age_min, DROP filter_age_max, DROP filter_dog_gender, DROP filter_dog_size
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match DROP FOREIGN KEY FK_98993E5DA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match DROP FOREIGN KEY FK_98993E5D6C066AFE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match CHANGE action action VARCHAR(20) NOT NULL COMMENT 'like, dislike', CHANGE match_score match_score NUMERIC(5, 2) DEFAULT NULL COMMENT 'Score de compatibilité (0-100)'
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match ADD CONSTRAINT FK_MATCH_TARGET FOREIGN KEY (target_user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match ADD CONSTRAINT FK_MATCH_USER FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match RENAME INDEX idx_98993e5d6c066afe TO IDX_TARGET
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_match RENAME INDEX idx_98993e5da76ed395 TO IDX_USER
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk DROP FOREIGN KEY FK_8D917A55A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk ADD walk_group_id INT DEFAULT NULL, CHANGE osm_id osm_id BIGINT DEFAULT NULL, CHANGE rating rating SMALLINT DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk ADD CONSTRAINT FK_8D917731A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE SET NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk ADD CONSTRAINT FK_8D917A553E506FC8 FOREIGN KEY (walk_group_id) REFERENCES `group` (id) ON UPDATE NO ACTION ON DELETE NO ACTION
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8D917A553E506FC8 ON walk (walk_group_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk RENAME INDEX idx_8d917a55a76ed395 TO IDX_8D917731A76ED395
        SQL);
    }
}
