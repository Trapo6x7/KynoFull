<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260306100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add osm_id, rating, user_id to walk table; make walk_group_id and start_at nullable';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE walk
                ADD osm_id BIGINT DEFAULT NULL,
                ADD rating SMALLINT DEFAULT NULL,
                ADD user_id INT DEFAULT NULL,
                MODIFY start_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)',
                MODIFY walk_group_id INT DEFAULT NULL
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE walk
                ADD CONSTRAINT FK_8D917731A76ED395
                    FOREIGN KEY (user_id) REFERENCES `user` (id)
                        ON DELETE SET NULL
        SQL);

        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_8D917731A76ED395 ON walk (user_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE walk DROP FOREIGN KEY FK_8D917731A76ED395
        SQL);

        $this->addSql(<<<'SQL'
            DROP INDEX IDX_8D917731A76ED395 ON walk
        SQL);

        $this->addSql(<<<'SQL'
            ALTER TABLE walk
                DROP COLUMN osm_id,
                DROP COLUMN rating,
                DROP COLUMN user_id,
                MODIFY start_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)',
                MODIFY walk_group_id INT NOT NULL
        SQL);
    }
}
