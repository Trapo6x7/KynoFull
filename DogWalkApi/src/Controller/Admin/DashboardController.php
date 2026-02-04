<?php

namespace App\Controller\Admin;

use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\HttpFoundation\Response;
use Doctrine\Persistence\ManagerRegistry;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Dog;
use App\Entity\User;
use App\Entity\Walk;
use App\Entity\Group;
use App\Entity\GroupMembership;
use App\Entity\Race;
use App\Entity\UserModeration;
use App\Entity\Review;
use App\Entity\Comment;

class DashboardController extends AbstractDashboardController
{
    private ManagerRegistry $doctrine;

    public function __construct(ManagerRegistry $doctrine)
    {
        $this->doctrine = $doctrine;
    }

    #[Route('/admin', name: 'admin')]
    public function index(): Response
    {
        // Restrict access to admins
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        // Fetch entity manager
        $em = $this->doctrine->getManager();
        // Fetch total counts for entities via QueryBuilder
        /** @var \Doctrine\ORM\EntityRepository $dogRepo */
        $dogRepo = $em->getRepository(Dog::class);
        $dogCount = $dogRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $userRepo */
        $userRepo = $em->getRepository(User::class);
        $userCount = $userRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $walkRepo */
        $walkRepo = $em->getRepository(Walk::class);
        $walkCount = $walkRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $groupRepo */
        $groupRepo = $em->getRepository(Group::class);
        $groupCount = $groupRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $membershipRepo */
        $membershipRepo = $em->getRepository(GroupMembership::class);
        $membershipCount = $membershipRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $raceRepo */
        $raceRepo = $em->getRepository(Race::class);
        $raceCount = $raceRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $moderationRepo */
        $moderationRepo = $em->getRepository(UserModeration::class);
        $moderationCount = $moderationRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $reviewRepo */
        $reviewRepo = $em->getRepository(Review::class);
        $reviewCount = $reviewRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();
        
        /** @var \Doctrine\ORM\EntityRepository $commentRepo */
        $commentRepo = $em->getRepository(Comment::class);
        $commentCount = $commentRepo->createQueryBuilder('e')->select('count(e.id)')->getQuery()->getSingleScalarResult();

        return $this->render('admin/dashboard.html.twig', [
            'counts' => [
                'dogs' => $dogCount,
                'users' => $userCount,
                'walks' => $walkCount,
                'groups' => $groupCount,
                'memberships' => $membershipCount,
                'races' => $raceCount,
                'moderations' => $moderationCount,
                'reviews' => $reviewCount,
                'comments' => $commentCount,
            ],
        ]);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('DogWalk Admin');
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');
        yield MenuItem::linkToCrud('Chiens', 'fas fa-dog', Dog::class);
        yield MenuItem::linkToCrud('Utilisateurs', 'fas fa-user', User::class);
        yield MenuItem::linkToCrud('Promenades', 'fas fa-walking', Walk::class);
        yield MenuItem::linkToCrud('Groupes', 'fas fa-users', Group::class);
        yield MenuItem::linkToCrud('Membres & Demandes', 'fas fa-user-tag', GroupMembership::class);
        yield MenuItem::linkToCrud('Races', 'fas fa-paw', Race::class);
        yield MenuItem::linkToCrud('Modérations', 'fas fa-shield-alt', UserModeration::class);
        yield MenuItem::linkToCrud('Avis', 'fas fa-star', Review::class);
        yield MenuItem::linkToCrud('Commentaires', 'fas fa-comment', Comment::class);
    }
}
