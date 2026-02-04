<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour remplacer les tables dog_keyword et user_keyword par une table polymorphique keywordables
 */
final class Version20260204100000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Remplace les tables dog_keyword et user_keyword par une table polymorphique keywordables';
    }

    public function up(Schema $schema): void
    {
        // Créer la nouvelle table keywordables
        $this->addSql('CREATE TABLE keywordables (
            id INT AUTO_INCREMENT NOT NULL,
            keyword_id INT NOT NULL,
            keywordable_type VARCHAR(50) NOT NULL,
            keywordable_id INT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX idx_keywordable (keywordable_type, keywordable_id),
            INDEX IDX_KEYWORD (keyword_id),
            UNIQUE INDEX unique_keyword_relation (keyword_id, keywordable_type, keywordable_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajouter la clé étrangère
        $this->addSql('ALTER TABLE keywordables ADD CONSTRAINT FK_KEYWORDABLES_KEYWORD FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON DELETE CASCADE');

        // Migrer les données existantes de user_keyword
        $this->addSql('INSERT INTO keywordables (keyword_id, keywordable_type, keywordable_id, created_at)
            SELECT keyword_id, \'user\', user_id, NOW()
            FROM user_keyword');

        // Migrer les données existantes de dog_keyword
        $this->addSql('INSERT INTO keywordables (keyword_id, keywordable_type, keywordable_id, created_at)
            SELECT keyword_id, \'dog\', dog_id, NOW()
            FROM dog_keyword');

        // Supprimer les anciennes tables
        $this->addSql('ALTER TABLE dog_keyword DROP FOREIGN KEY FK_D89DA8E9634DFEB');
        $this->addSql('ALTER TABLE dog_keyword DROP FOREIGN KEY FK_D89DA8E9115D4552');
        $this->addSql('DROP TABLE dog_keyword');

        $this->addSql('ALTER TABLE user_keyword DROP FOREIGN KEY FK_29E6F31A76ED395');
        $this->addSql('ALTER TABLE user_keyword DROP FOREIGN KEY FK_29E6F31115D4552');
        $this->addSql('DROP TABLE user_keyword');
    }

    public function down(Schema $schema): void
    {
        // Recréer les anciennes tables
        $this->addSql('CREATE TABLE dog_keyword (
            dog_id INT NOT NULL,
            keyword_id INT NOT NULL,
            INDEX IDX_D89DA8E9634DFEB (dog_id),
            INDEX IDX_D89DA8E9115D4552 (keyword_id),
            PRIMARY KEY(dog_id, keyword_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('CREATE TABLE user_keyword (
            user_id INT NOT NULL,
            keyword_id INT NOT NULL,
            INDEX IDX_29E6F31A76ED395 (user_id),
            INDEX IDX_29E6F31115D4552 (keyword_id),
            PRIMARY KEY(user_id, keyword_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Ajouter les clés étrangères
        $this->addSql('ALTER TABLE dog_keyword ADD CONSTRAINT FK_D89DA8E9634DFEB FOREIGN KEY (dog_id) REFERENCES dog (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE dog_keyword ADD CONSTRAINT FK_D89DA8E9115D4552 FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON DELETE CASCADE');

        $this->addSql('ALTER TABLE user_keyword ADD CONSTRAINT FK_29E6F31A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_keyword ADD CONSTRAINT FK_29E6F31115D4552 FOREIGN KEY (keyword_id) REFERENCES keyword (id) ON DELETE CASCADE');

        // Migrer les données
        $this->addSql('INSERT INTO user_keyword (user_id, keyword_id)
            SELECT keywordable_id, keyword_id
            FROM keywordables
            WHERE keywordable_type = \'user\'');

        $this->addSql('INSERT INTO dog_keyword (dog_id, keyword_id)
            SELECT keywordable_id, keyword_id
            FROM keywordables
            WHERE keywordable_type = \'dog\'');

        // Supprimer la table keywordables
        $this->addSql('ALTER TABLE keywordables DROP FOREIGN KEY FK_KEYWORDABLES_KEYWORD');
        $this->addSql('DROP TABLE keywordables');
    }
}
