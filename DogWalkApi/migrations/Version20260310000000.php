<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260310000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remove group conversation support: drop type, group_id columns and unique_group_conversation index';
    }

    public function up(Schema $schema): void
    {
        // Supprimer les conversations de groupe existantes (seulement si la colonne type existe encore)
        $this->addSql("
            SET @type_exists_del = (
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'conversation'
                AND COLUMN_NAME = 'type'
            );
        ");
        $this->addSql("SET @sql_del = IF(@type_exists_del > 0, \"DELETE FROM conversation WHERE type = 'group'\", 'SELECT 1');");
        $this->addSql("PREPARE stmt_del FROM @sql_del;");
        $this->addSql("EXECUTE stmt_del;");
        $this->addSql("DEALLOCATE PREPARE stmt_del;");

        // Récupérer et supprimer la contrainte FK si elle existe
        $this->addSql("
            SET @fk_name = (
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'conversation' 
                AND COLUMN_NAME = 'group_id' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
                LIMIT 1
            );
        ");
        $this->addSql("SET @sql = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE conversation DROP FOREIGN KEY ', @fk_name), 'SELECT 1');");
        $this->addSql("PREPARE stmt FROM @sql;");
        $this->addSql("EXECUTE stmt;");
        $this->addSql("DEALLOCATE PREPARE stmt;");

        // Supprimer l'index unique sur group_id s'il existe
        $this->addSql("
            SET @idx_exists = (
                SELECT COUNT(*) 
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'conversation' 
                AND INDEX_NAME = 'unique_group_conversation'
            );
        ");
        $this->addSql("SET @sql = IF(@idx_exists > 0, 'DROP INDEX unique_group_conversation ON conversation', 'SELECT 1');");
        $this->addSql("PREPARE stmt FROM @sql;");
        $this->addSql("EXECUTE stmt;");
        $this->addSql("DEALLOCATE PREPARE stmt;");

        // Supprimer les colonnes si elles existent
        $this->addSql("
            SET @col_exists = (
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'conversation' 
                AND COLUMN_NAME = 'group_id'
            );
        ");
        $this->addSql("SET @sql = IF(@col_exists > 0, 'ALTER TABLE conversation DROP COLUMN group_id', 'SELECT 1');");
        $this->addSql("PREPARE stmt FROM @sql;");
        $this->addSql("EXECUTE stmt;");
        $this->addSql("DEALLOCATE PREPARE stmt;");

        $this->addSql("
            SET @col_exists = (
                SELECT COUNT(*) 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'conversation' 
                AND COLUMN_NAME = 'type'
            );
        ");
        $this->addSql("SET @sql = IF(@col_exists > 0, 'ALTER TABLE conversation DROP COLUMN type', 'SELECT 1');");
        $this->addSql("PREPARE stmt FROM @sql;");
        $this->addSql("EXECUTE stmt;");
        $this->addSql("DEALLOCATE PREPARE stmt;");

        // Rendre participant1_id et participant2_id NOT NULL
        // (nécessite de dropper les FK, modifier, puis les recréer)
        $this->addSql("
            SET @fk_p1 = (
                SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conversation'
                AND COLUMN_NAME = 'participant1_id' AND REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1
            );
        ");
        $this->addSql("SET @sql = IF(@fk_p1 IS NOT NULL, CONCAT('ALTER TABLE conversation DROP FOREIGN KEY ', @fk_p1), 'SELECT 1');");
        $this->addSql("PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;");

        $this->addSql("
            SET @fk_p2 = (
                SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conversation'
                AND COLUMN_NAME = 'participant2_id' AND REFERENCED_TABLE_NAME IS NOT NULL LIMIT 1
            );
        ");
        $this->addSql("SET @sql = IF(@fk_p2 IS NOT NULL, CONCAT('ALTER TABLE conversation DROP FOREIGN KEY ', @fk_p2), 'SELECT 1');");
        $this->addSql("PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;");

        $this->addSql('ALTER TABLE conversation
            MODIFY participant1_id INT NOT NULL,
            MODIFY participant2_id INT NOT NULL,
            ADD CONSTRAINT FK_conv_p1 FOREIGN KEY (participant1_id) REFERENCES user(id) ON DELETE CASCADE,
            ADD CONSTRAINT FK_conv_p2 FOREIGN KEY (participant2_id) REFERENCES user(id) ON DELETE CASCADE
        ');
    }

    public function down(Schema $schema): void
    {
        // Recréer les colonnes
        $this->addSql('ALTER TABLE conversation ADD type VARCHAR(20) NOT NULL DEFAULT \'private\'');
        $this->addSql('ALTER TABLE conversation ADD group_id INT DEFAULT NULL');

        // Rendre les participants nullable
        $this->addSql('ALTER TABLE conversation MODIFY participant1_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE conversation MODIFY participant2_id INT DEFAULT NULL');

        // Recréer l'index
        $this->addSql('CREATE UNIQUE INDEX unique_group_conversation ON conversation (group_id)');

        // Recréer la FK
        $this->addSql('ALTER TABLE conversation ADD CONSTRAINT FK_8A8E26E9FE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id) ON DELETE CASCADE');
    }
}
