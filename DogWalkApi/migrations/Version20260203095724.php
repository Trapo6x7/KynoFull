<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203095724 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE dog ADD size VARCHAR(50) DEFAULT NULL, ADD description LONGTEXT DEFAULT NULL, ADD keywords JSON DEFAULT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user ADD gender VARCHAR(50) DEFAULT NULL, ADD profession VARCHAR(255) DEFAULT NULL, ADD keywords JSON DEFAULT NULL, ADD latitude DOUBLE PRECISION DEFAULT NULL, ADD longitude DOUBLE PRECISION DEFAULT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE dog DROP size, DROP description, DROP keywords
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user DROP gender, DROP profession, DROP keywords, DROP latitude, DROP longitude
        SQL);
    }
}
