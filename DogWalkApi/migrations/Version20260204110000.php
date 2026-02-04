<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour rendre la table comment polymorphique
 */
final class Version20260204110000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rend la table comment polymorphique avec commented_type et commented_id';
    }

    public function up(Schema $schema): void
    {
        // Ajouter les nouvelles colonnes
        $this->addSql('ALTER TABLE comment ADD commented_type VARCHAR(50) NOT NULL DEFAULT \'group\'');
        $this->addSql('ALTER TABLE comment ADD commented_id INT NOT NULL DEFAULT 0');
        $this->addSql('ALTER TABLE comment ADD created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT \'(DC2Type:datetime_immutable)\'');

        // Migrer les données existantes (les commentaires sont actuellement sur les groupes)
        $this->addSql('UPDATE comment SET commented_id = group_id WHERE group_id IS NOT NULL');
        
        // Supprimer la valeur par défaut maintenant que les données sont migrées
        $this->addSql('ALTER TABLE comment ALTER commented_type DROP DEFAULT');
        $this->addSql('ALTER TABLE comment ALTER commented_id DROP DEFAULT');

        // Créer l'index pour les performances
        $this->addSql('CREATE INDEX idx_commented ON comment (commented_type, commented_id)');

        // Supprimer l'ancienne clé étrangère et la colonne group_id
        $this->addSql('ALTER TABLE comment DROP FOREIGN KEY FK_9474526CFE54D947');
        $this->addSql('DROP INDEX IDX_9474526CFE54D947 ON comment');
        $this->addSql('ALTER TABLE comment DROP group_id');
    }

    public function down(Schema $schema): void
    {
        // Recréer la colonne group_id
        $this->addSql('ALTER TABLE comment ADD group_id INT DEFAULT NULL');

        // Migrer les données des commentaires de type "group" vers group_id
        $this->addSql('UPDATE comment SET group_id = commented_id WHERE commented_type = \'group\'');

        // Recréer l'index et la clé étrangère
        $this->addSql('ALTER TABLE comment ADD CONSTRAINT FK_9474526CFE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id)');
        $this->addSql('CREATE INDEX IDX_9474526CFE54D947 ON comment (group_id)');

        // Rendre group_id non nullable pour les commentaires de groupe
        $this->addSql('ALTER TABLE comment MODIFY group_id INT NOT NULL');

        // Supprimer les colonnes polymorphiques
        $this->addSql('DROP INDEX idx_commented ON comment');
        $this->addSql('ALTER TABLE comment DROP commented_type');
        $this->addSql('ALTER TABLE comment DROP commented_id');
        $this->addSql('ALTER TABLE comment DROP created_at');
    }
}
