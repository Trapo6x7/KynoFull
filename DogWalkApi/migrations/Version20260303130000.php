<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260303130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add group conversation support: type, group_id FK, make participants nullable';
    }

    public function up(Schema $schema): void
    {
        // Rendre les participants nullable (les conversations de groupe n'en ont pas)
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation
                MODIFY participant1_id INT DEFAULT NULL,
                MODIFY participant2_id INT DEFAULT NULL
        SQL);

        // Ajouter le type et la FK vers le groupe
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation
                ADD type VARCHAR(20) NOT NULL DEFAULT 'private',
                ADD group_id INT DEFAULT NULL
        SQL);

        // FK vers la table group (backtick car mot réservé)
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation
                ADD CONSTRAINT FK_conversation_group
                    FOREIGN KEY (group_id) REFERENCES `group` (id) ON DELETE CASCADE
        SQL);

        // Index + contrainte d'unicité sur group_id
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX unique_group_conversation ON conversation (group_id)
        SQL);

        // Index pour accélérer les recherches par type
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_CONVERSATION_TYPE ON conversation (type)
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX IDX_CONVERSATION_TYPE ON conversation');
        $this->addSql('DROP INDEX unique_group_conversation ON conversation');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_conversation_group');
        $this->addSql('ALTER TABLE conversation DROP COLUMN group_id, DROP COLUMN type');
        $this->addSql(<<<'SQL'
            ALTER TABLE conversation
                MODIFY participant1_id INT NOT NULL,
                MODIFY participant2_id INT NOT NULL
        SQL);
    }
}
