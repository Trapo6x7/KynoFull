<?php

namespace App\Command;

use App\Entity\Keyword;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:load-keywords',
    description: 'Load predefined keywords into the database',
)]
class LoadKeywordsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $keywords = [
            // User keywords - Personnalité
            ['name' => 'Dynamique', 'category' => 'user'],
            ['name' => 'Calme', 'category' => 'user'],
            ['name' => 'Sociable', 'category' => 'user'],
            ['name' => 'Sportif', 'category' => 'user'],
            ['name' => 'Aventurier', 'category' => 'user'],
            ['name' => 'Patient', 'category' => 'user'],
            ['name' => 'Énergique', 'category' => 'user'],
            ['name' => 'Détendu', 'category' => 'user'],
            
            // User keywords - Expérience
            ['name' => 'Débutant', 'category' => 'user'],
            ['name' => 'Expérimenté', 'category' => 'user'],
            ['name' => 'Professionnel', 'category' => 'user'],
            
            // User keywords - Disponibilité
            ['name' => 'Matin', 'category' => 'user'],
            ['name' => 'Midi', 'category' => 'user'],
            ['name' => 'Soir', 'category' => 'user'],
            ['name' => 'Week-end', 'category' => 'user'],
            ['name' => 'Semaine', 'category' => 'user'],
            
            // User keywords - Préférences de promenade
            ['name' => 'Promenade courte', 'category' => 'user'],
            ['name' => 'Promenade longue', 'category' => 'user'],
            ['name' => 'Jogging', 'category' => 'user'],
            ['name' => 'Randonnée', 'category' => 'user'],
            ['name' => 'Parc', 'category' => 'user'],
            ['name' => 'Forêt', 'category' => 'user'],
            ['name' => 'Plage', 'category' => 'user'],
            ['name' => 'Ville', 'category' => 'user'],
            
            // Dog keywords - Tempérament
            ['name' => 'Joueur', 'category' => 'dog'],
            ['name' => 'Calme', 'category' => 'dog'],
            ['name' => 'Affectueux', 'category' => 'dog'],
            ['name' => 'Énergique', 'category' => 'dog'],
            ['name' => 'Obéissant', 'category' => 'dog'],
            ['name' => 'Indépendant', 'category' => 'dog'],
            ['name' => 'Protecteur', 'category' => 'dog'],
            ['name' => 'Timide', 'category' => 'dog'],
            ['name' => 'Sociable', 'category' => 'dog'],
            ['name' => 'Dominant', 'category' => 'dog'],
            
            // Dog keywords - Comportement social
            ['name' => 'Aime les chiens', 'category' => 'dog'],
            ['name' => 'Aime les enfants', 'category' => 'dog'],
            ['name' => 'Aime les chats', 'category' => 'dog'],
            ['name' => 'Méfiant étrangers', 'category' => 'dog'],
            
            // Dog keywords - Niveau d'activité
            ['name' => 'Très actif', 'category' => 'dog'],
            ['name' => 'Actif', 'category' => 'dog'],
            ['name' => 'Modéré', 'category' => 'dog'],
            ['name' => 'Peu actif', 'category' => 'dog'],
            
            // Dog keywords - Formation
            ['name' => 'Éduqué', 'category' => 'dog'],
            ['name' => 'En apprentissage', 'category' => 'dog'],
            ['name' => 'Dressé', 'category' => 'dog'],
            
            // Dog keywords - Santé/Besoins
            ['name' => 'Allergies', 'category' => 'dog'],
            ['name' => 'Besoins spéciaux', 'category' => 'dog'],
            ['name' => 'Sénior', 'category' => 'dog'],
            ['name' => 'Chiot', 'category' => 'dog'],
            ['name' => 'Stérilisé', 'category' => 'dog'],
            
            // Activity keywords
            ['name' => 'Balade quotidienne', 'category' => 'activity'],
            ['name' => 'Course', 'category' => 'activity'],
            ['name' => 'Jeux', 'category' => 'activity'],
            ['name' => 'Socialisation', 'category' => 'activity'],
            ['name' => 'Éducation', 'category' => 'activity'],
            ['name' => 'Agility', 'category' => 'activity'],
            ['name' => 'Canicross', 'category' => 'activity'],
            ['name' => 'Promenade groupe', 'category' => 'activity'],
            ['name' => 'Promenade solo', 'category' => 'activity'],
            ['name' => 'Gardiennage', 'category' => 'activity'],
        ];

        $repository = $this->entityManager->getRepository(Keyword::class);
        $created = 0;
        $skipped = 0;

        foreach ($keywords as $keywordData) {
            // Vérifier si le keyword existe déjà
            $existing = $repository->findOneBy([
                'name' => $keywordData['name'],
                'category' => $keywordData['category']
            ]);

            if ($existing) {
                $skipped++;
                continue;
            }

            $keyword = new Keyword();
            $keyword->setName($keywordData['name']);
            $keyword->setCategory($keywordData['category']);

            $this->entityManager->persist($keyword);
            $created++;
        }

        $this->entityManager->flush();

        $io->success(sprintf(
            'Keywords loaded successfully! Created: %d, Skipped (already exists): %d',
            $created,
            $skipped
        ));

        return Command::SUCCESS;
    }
}
