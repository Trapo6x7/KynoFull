<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Ajout des champs verification_code et verification_code_expires_at pour la vérification par code
 */
final class Version20260205120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Ajoute les champs verification_code et verification_code_expires_at à la table user';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user ADD verification_code VARCHAR(6) DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD verification_code_expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE user DROP verification_code');
        $this->addSql('ALTER TABLE user DROP verification_code_expires_at');
    }
}
