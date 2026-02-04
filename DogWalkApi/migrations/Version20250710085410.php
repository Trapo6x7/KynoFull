<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250710085410 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE block_list (id INT AUTO_INCREMENT NOT NULL, blocker_id INT NOT NULL, blocked_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_82A6AA63548D5975 (blocker_id), INDEX IDX_82A6AA6321FF5136 (blocked_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE comment (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, group_id INT NOT NULL, content LONGTEXT NOT NULL, INDEX IDX_9474526CA76ED395 (user_id), INDEX IDX_9474526CFE54D947 (group_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE dog (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, name VARCHAR(255) NOT NULL, gender VARCHAR(255) NOT NULL, birthdate DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', image_filename VARCHAR(255) DEFAULT NULL, INDEX IDX_812C397DA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE dog_race (dog_id INT NOT NULL, race_id INT NOT NULL, INDEX IDX_18E44E6F634DFEB (dog_id), INDEX IDX_18E44E6F6E59D40D (race_id), PRIMARY KEY(dog_id, race_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE `group` (id INT AUTO_INCREMENT NOT NULL, creator_id INT NOT NULL, mixed TINYINT(1) NOT NULL, comment VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', deleted_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', name VARCHAR(255) NOT NULL, INDEX IDX_6DC044C561220EA6 (creator_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE group_request (id INT AUTO_INCREMENT NOT NULL, walk_group_id INT NOT NULL, user_id INT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', status TINYINT(1) NOT NULL, INDEX IDX_BD97DB933E506FC8 (walk_group_id), INDEX IDX_BD97DB93A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE group_role (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, walk_group_id INT NOT NULL, role VARCHAR(255) NOT NULL, INDEX IDX_7E33D11AA76ED395 (user_id), INDEX IDX_7E33D11A3E506FC8 (walk_group_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE race (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, reporter_id INT NOT NULL, reported_id INT NOT NULL, comment VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', statut TINYINT(1) NOT NULL, INDEX IDX_C42F7784E1CFE6F5 (reporter_id), INDEX IDX_C42F778494BDEEB6 (reported_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE review (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, walk_group_id INT NOT NULL, rating INT NOT NULL, comment VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_794381C6A76ED395 (user_id), INDEX IDX_794381C63E506FC8 (walk_group_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, birthdate DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', is_verified TINYINT(1) NOT NULL, score INT NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', deleted_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', image_filename VARCHAR(255) DEFAULT NULL, description LONGTEXT DEFAULT NULL, city VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE walk (id INT AUTO_INCREMENT NOT NULL, walk_group_id INT NOT NULL, name VARCHAR(255) NOT NULL, location VARCHAR(255) NOT NULL, start_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_8D917A553E506FC8 (walk_group_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE block_list ADD CONSTRAINT FK_82A6AA63548D5975 FOREIGN KEY (blocker_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE block_list ADD CONSTRAINT FK_82A6AA6321FF5136 FOREIGN KEY (blocked_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comment ADD CONSTRAINT FK_9474526CA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comment ADD CONSTRAINT FK_9474526CFE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog ADD CONSTRAINT FK_812C397DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_race ADD CONSTRAINT FK_18E44E6F634DFEB FOREIGN KEY (dog_id) REFERENCES dog (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_race ADD CONSTRAINT FK_18E44E6F6E59D40D FOREIGN KEY (race_id) REFERENCES race (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `group` ADD CONSTRAINT FK_6DC044C561220EA6 FOREIGN KEY (creator_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_request ADD CONSTRAINT FK_BD97DB933E506FC8 FOREIGN KEY (walk_group_id) REFERENCES `group` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_request ADD CONSTRAINT FK_BD97DB93A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_role ADD CONSTRAINT FK_7E33D11AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_role ADD CONSTRAINT FK_7E33D11A3E506FC8 FOREIGN KEY (walk_group_id) REFERENCES `group` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE report ADD CONSTRAINT FK_C42F7784E1CFE6F5 FOREIGN KEY (reporter_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE report ADD CONSTRAINT FK_C42F778494BDEEB6 FOREIGN KEY (reported_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review ADD CONSTRAINT FK_794381C6A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review ADD CONSTRAINT FK_794381C63E506FC8 FOREIGN KEY (walk_group_id) REFERENCES `group` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk ADD CONSTRAINT FK_8D917A553E506FC8 FOREIGN KEY (walk_group_id) REFERENCES `group` (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE block_list DROP FOREIGN KEY FK_82A6AA63548D5975
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE block_list DROP FOREIGN KEY FK_82A6AA6321FF5136
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comment DROP FOREIGN KEY FK_9474526CA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE comment DROP FOREIGN KEY FK_9474526CFE54D947
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog DROP FOREIGN KEY FK_812C397DA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_race DROP FOREIGN KEY FK_18E44E6F634DFEB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE dog_race DROP FOREIGN KEY FK_18E44E6F6E59D40D
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE `group` DROP FOREIGN KEY FK_6DC044C561220EA6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_request DROP FOREIGN KEY FK_BD97DB933E506FC8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_request DROP FOREIGN KEY FK_BD97DB93A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_role DROP FOREIGN KEY FK_7E33D11AA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE group_role DROP FOREIGN KEY FK_7E33D11A3E506FC8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE report DROP FOREIGN KEY FK_C42F7784E1CFE6F5
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE report DROP FOREIGN KEY FK_C42F778494BDEEB6
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review DROP FOREIGN KEY FK_794381C6A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE review DROP FOREIGN KEY FK_794381C63E506FC8
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE walk DROP FOREIGN KEY FK_8D917A553E506FC8
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE block_list
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE comment
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE dog
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE dog_race
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE `group`
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE group_request
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE group_role
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE race
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE report
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE review
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE user
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE walk
        SQL);
    }
}
