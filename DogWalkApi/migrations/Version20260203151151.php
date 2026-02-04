<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260203151151 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE dog_keyword (dog_id INT NOT NULL, keyword_id INT NOT NULL, INDEX IDX_D89DA8E9634DFEB (dog_id), INDEX IDX_D89DA8E9115D4552 (keyword_id), PRIMARY KEY(dog_id, keyword_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE user_keyword (user_id INT NOT NULL, keyword_id INT NOT NULL, INDEX IDX_29E6F31A76ED395 (user_id), INDEX IDX_29E6F31115D4552 (keyword_id), PRIMARY KEY(user_id, keyword_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_keyword ADD CONSTRAINT FK_D89DA8E9634DFEB FOREIGN KEY (dog_id) REFERENCES dog (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_keyword ADD CONSTRAINT FK_D89DA8E9115D4552 FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_keyword ADD CONSTRAINT FK_29E6F31A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_keyword ADD CONSTRAINT FK_29E6F31115D4552 FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX unique_keyword_category ON keyword
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE keyword CHANGE category category VARCHAR(50) NOT NULL, CHANGE created_at created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_keyword DROP FOREIGN KEY FK_D89DA8E9634DFEB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_keyword DROP FOREIGN KEY FK_D89DA8E9115D4552
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_keyword DROP FOREIGN KEY FK_29E6F31A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE user_keyword DROP FOREIGN KEY FK_29E6F31115D4552
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE dog_keyword
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE user_keyword
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE keyword CHANGE category category VARCHAR(50) NOT NULL COMMENT 'user, dog, activity', CHANGE created_at created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        SQL);
        $this->addSql(<<<'SQL'
            CREATE UNIQUE INDEX unique_keyword_category ON keyword (name, category)
        SQL);
    }
}
