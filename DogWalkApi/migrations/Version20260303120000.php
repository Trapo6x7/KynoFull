<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260303120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create conversation and message tables for the chat feature';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            CREATE TABLE conversation (
                id INT AUTO_INCREMENT NOT NULL,
                participant1_id INT NOT NULL,
                participant2_id INT NOT NULL,
                last_message_content LONGTEXT DEFAULT NULL,
                last_message_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
                unread_count1 INT NOT NULL DEFAULT 0,
                unread_count2 INT NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                INDEX IDX_8A8E26E9B0F4A9E5 (participant1_id),
                INDEX IDX_8A8E26E9D0919A2A (participant2_id),
                UNIQUE INDEX uq_conversation_participants (participant1_id, participant2_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            CREATE TABLE message (
                id INT AUTO_INCREMENT NOT NULL,
                conversation_id INT NOT NULL,
                sender_id INT NOT NULL,
                content LONGTEXT NOT NULL,
                is_read TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                INDEX IDX_B6BD307F9AC0396 (conversation_id),
                INDEX IDX_B6BD307FF624B39D (sender_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE conversation
                ADD CONSTRAINT FK_conversation_participant1
                    FOREIGN KEY (participant1_id) REFERENCES user (id) ON DELETE CASCADE,
                ADD CONSTRAINT FK_conversation_participant2
                    FOREIGN KEY (participant2_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE message
                ADD CONSTRAINT FK_message_conversation
                    FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE,
                ADD CONSTRAINT FK_message_sender
                    FOREIGN KEY (sender_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_message_conversation');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_message_sender');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_conversation_participant1');
        $this->addSql('ALTER TABLE conversation DROP FOREIGN KEY FK_conversation_participant2');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE conversation');
    }
}
