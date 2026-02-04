-- Création de la table keyword pour les mots-clés prédéfinis
CREATE TABLE IF NOT EXISTS keyword (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL COMMENT 'user, dog, activity',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_keyword_category (name, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des mots-clés pour les utilisateurs
INSERT INTO keyword (name, category) VALUES
-- Personnalité
('Dynamique', 'user'),
('Calme', 'user'),
('Sociable', 'user'),
('Sportif', 'user'),
('Aventurier', 'user'),
('Patient', 'user'),
('Énergique', 'user'),
('Détendu', 'user'),

-- Expérience
('Débutant', 'user'),
('Expérimenté', 'user'),
('Professionnel', 'user'),

-- Disponibilité
('Matin', 'user'),
('Midi', 'user'),
('Soir', 'user'),
('Week-end', 'user'),
('Semaine', 'user'),

-- Préférences de promenade
('Promenade courte', 'user'),
('Promenade longue', 'user'),
('Jogging', 'user'),
('Randonnée', 'user'),
('Parc', 'user'),
('Forêt', 'user'),
('Plage', 'user'),
('Ville', 'user');

-- Insertion des mots-clés pour les chiens
INSERT INTO keyword (name, category) VALUES
-- Tempérament
('Joueur', 'dog'),
('Calme', 'dog'),
('Affectueux', 'dog'),
('Énergique', 'dog'),
('Obéissant', 'dog'),
('Indépendant', 'dog'),
('Protecteur', 'dog'),
('Timide', 'dog'),
('Sociable', 'dog'),
('Dominant', 'dog'),

-- Comportement social
('Aime les chiens', 'dog'),
('Aime les enfants', 'dog'),
('Aime les chats', 'dog'),
('Méfiant étrangers', 'dog'),

-- Niveau d\'activité
('Très actif', 'dog'),
('Actif', 'dog'),
('Modéré', 'dog'),
('Peu actif', 'dog'),

-- Formation
('Éduqué', 'dog'),
('En apprentissage', 'dog'),
('Dressé', 'dog'),

-- Santé/Besoins
('Allergies', 'dog'),
('Besoins spéciaux', 'dog'),
('Sénior', 'dog'),
('Chiot', 'dog'),
('Stérilisé', 'dog');

-- Insertion des mots-clés pour les activités
INSERT INTO keyword (name, category) VALUES
('Balade quotidienne', 'activity'),
('Course', 'activity'),
('Jeux', 'activity'),
('Socialisation', 'activity'),
('Éducation', 'activity'),
('Agility', 'activity'),
('Canicross', 'activity'),
('Promenade groupe', 'activity'),
('Promenade solo', 'activity'),
('Gardiennage', 'activity');
