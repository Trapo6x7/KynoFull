-- Table polymorphique pour associer les keywords à n'importe quelle entité (User, Dog, Group, etc.)

-- Table unique keywordables remplace les anciennes tables user_keyword et dog_keyword
CREATE TABLE IF NOT EXISTS keywordables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    keyword_id INT NOT NULL,
    keywordable_type VARCHAR(50) NOT NULL COMMENT 'Type d''entité: user, dog, group, etc.',
    keywordable_id INT NOT NULL COMMENT 'ID de l''entité associée',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour les recherches par entité
    INDEX idx_keywordable (keywordable_type, keywordable_id),
    
    -- Index pour les recherches par keyword
    INDEX idx_keyword (keyword_id),
    
    -- Contrainte d'unicité pour éviter les doublons
    UNIQUE KEY unique_keyword_relation (keyword_id, keywordable_type, keywordable_id),
    
    -- Clé étrangère vers la table keyword
    FOREIGN KEY (keyword_id) REFERENCES keyword(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration des anciennes données (si les tables existent)
-- INSERT INTO keywordables (keyword_id, keywordable_type, keywordable_id)
-- SELECT keyword_id, 'user', user_id FROM user_keyword;

-- INSERT INTO keywordables (keyword_id, keywordable_type, keywordable_id)
-- SELECT keyword_id, 'dog', dog_id FROM dog_keyword;

-- Suppression des anciennes tables (après migration)
-- DROP TABLE IF EXISTS user_keyword;
-- DROP TABLE IF EXISTS dog_keyword;
