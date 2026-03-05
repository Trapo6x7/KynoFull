<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260305100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add private_mode column to user table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE `user`
                ADD private_mode TINYINT(1) NOT NULL DEFAULT 0
        SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE `user`
                DROP COLUMN private_mode
        SQL);
    }
}
