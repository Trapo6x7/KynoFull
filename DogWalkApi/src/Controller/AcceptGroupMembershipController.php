<?php

namespace App\Controller;

use App\Entity\GroupMembership;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class AcceptGroupMembershipController extends AbstractController
{
    public function __invoke(GroupMembership $data, EntityManagerInterface $em): GroupMembership
    {
        $user = $this->getUser();
        $group = $data->getWalkGroup();

        // Vérifier que l'utilisateur courant est le créateur du groupe
        if (!$group->getMemberships()->filter(fn($m) => $m->getUser() === $user && $m->getRole() === GroupMembership::ROLE_CREATOR)->count()) {
            throw new AccessDeniedHttpException('Seul le créateur du groupe peut accepter une demande.');
        }

        // Accepter la demande (passer de "requested" à "active")
        $data->accept();

        $em->persist($data);
        $em->flush();

        return $data;
    }
}
