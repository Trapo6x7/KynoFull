

export default function TermsAndConditions({ onBack }: { onBack?: () => void }) {
  return (
    <section className="max-w-3xl mx-auto p-10 flex flex-col gap-4 justify-center text-left rounded-lg">
      <h1 className="text-2xl font-bold text-center w-full">Conditions Générales d’Utilisation (CGU) DogWalk</h1>
      <p className="italic text-center w-full">Dernière mise à jour : 9 juillet 2025</p>

      <h2 className="text-xl font-semibold mt-4">1. Objet</h2>
      <p>
        Les présentes Conditions Générales d’Utilisation (CGU) ont pour objet de définir les modalités d’utilisation de la plateforme DogWalk, accessible à l’adresse [URL], par tout utilisateur (ci-après « l’Utilisateur »). En accédant au site et/ou à l’application DogWalk, l’Utilisateur accepte sans réserve les présentes CGU.
      </p>

      <h2 className="text-xl font-semibold mt-4">2. Description du service</h2>
      <p>DogWalk est une application web permettant aux propriétaires de chiens de :</p>
      <ul className="list-disc list-inside ml-4">
        <li>Créer un compte utilisateur</li>
        <li>Ajouter des profils de chiens</li>
        <li>Rejoindre ou créer des groupes de promenade</li>
        <li>Organiser et participer à des balades géolocalisées</li>
        <li>Laisser des commentaires et des avis</li>
        <li>Signaler ou modérer certains contenus</li>
      </ul>
      <p>Le service est gratuit pour les utilisateurs.</p>

      <h2 className="text-xl font-semibold mt-4">3. Accès au service</h2>
      <p>L’accès à DogWalk nécessite :</p>
      <ul className="list-disc list-inside ml-4">
        <li>Une connexion Internet</li>
        <li>Un navigateur web récent</li>
        <li>Une inscription avec une adresse email valide</li>
      </ul>
      <p>
        L’Utilisateur s’engage à fournir des informations exactes lors de son inscription, et à mettre à jour ses données si nécessaire.
      </p>

      <h2 className="text-xl font-semibold mt-4">4. Création et gestion du compte</h2>
      <p>
        Chaque Utilisateur dispose d’un compte personnel, protégé par mot de passe.<br />
        L’Utilisateur est responsable de la confidentialité de ses identifiants et de toutes les actions effectuées via son compte.
      </p>
      <p>
        DogWalk se réserve le droit de supprimer un compte en cas de non-respect des présentes CGU ou d’activité jugée abusive, frauduleuse ou contraire à l’éthique.
      </p>

      <h2 className="text-xl font-semibold mt-4">5. Comportement des utilisateurs</h2>
      <p>L’Utilisateur s’engage à :</p>
      <ul className="list-disc list-inside ml-4">
        <li>Ne pas publier de contenu illégal, diffamatoire, injurieux ou discriminatoire</li>
        <li>Respecter les autres membres de la communauté</li>
        <li>Ne pas usurper l’identité d’un tiers</li>
        <li>Ne pas harceler, menacer ou nuire à d’autres utilisateurs</li>
        <li>Respecter les règles des groupes et balades auxquels il participe</li>
      </ul>
      <p>
        En cas de non-respect, DogWalk peut suspendre ou supprimer l’accès à tout ou partie du service.
      </p>

      <h2 className="text-xl font-semibold mt-4">6. Modération et signalement</h2>
      <p>
        Les Utilisateurs peuvent signaler tout contenu ou comportement inapproprié via les outils intégrés à l’application.<br />
        DogWalk se réserve le droit de modérer, masquer ou supprimer tout contenu non conforme aux présentes CGU, sans justification préalable.
      </p>

      <h2 className="text-xl font-semibold mt-4">7. Données personnelles</h2>
      <p>
        DogWalk collecte des données personnelles pour permettre le fonctionnement du service (email, nom, localisation, profil des chiens, avatar, etc.).
      </p>
      <p>
        Conformément au RGPD, l’Utilisateur dispose d’un droit d’accès, de rectification, de suppression et de portabilité de ses données personnelles, qu’il peut exercer en contactant : [adresse e-mail de contact].
      </p>
      <p>
        Les données sont stockées de manière sécurisée et ne sont en aucun cas cédées à des tiers sans consentement.
      </p>

      <h2 className="text-xl font-semibold mt-4">8. Sécurité</h2>
      <p>DogWalk met en œuvre les moyens nécessaires pour sécuriser les données et les connexions :</p>
      <ul className="list-disc list-inside ml-4">
        <li>Chiffrement des mots de passe (hash)</li>
        <li>Authentification par token JWT</li>
        <li>Protection contre les accès non autorisés</li>
        <li>Sécurisation HTTPS</li>
      </ul>
      <p>
        Cependant, l’Utilisateur reconnaît que l’Internet ne permet pas de garantir une sécurité absolue.
      </p>

      <h2 className="text-xl font-semibold mt-4">9. Propriété intellectuelle</h2>
      <p>
        L’ensemble du contenu de DogWalk (logos, textes, images, code source, etc.) est protégé par les lois en vigueur sur la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, diffusion ou exploitation non autorisée du service est strictement interdite.
      </p>
      <p>
        Les Utilisateurs conservent les droits sur les contenus qu’ils publient, mais accordent à DogWalk une licence non exclusive d’utilisation pour l’exploitation du service (affichage, partage, stockage).
      </p>

      <h2 className="text-xl font-semibold mt-4">10. Responsabilités</h2>
      <p>DogWalk ne peut être tenu responsable :</p>
      <ul className="list-disc list-inside ml-4">
        <li>Des problèmes de connexion ou d’accès au service</li>
        <li>Des contenus publiés par les Utilisateurs</li>
        <li>Des dommages directs ou indirects liés à l’utilisation du service</li>
      </ul>
      <p>
        Chaque Utilisateur est seul responsable de ses actes et de ses publications sur la plateforme.
      </p>

      <h2 className="text-xl font-semibold mt-4">11. Modification des CGU</h2>
      <p>
        DogWalk se réserve le droit de modifier les présentes CGU à tout moment.<br />
        Les modifications entreront en vigueur dès leur publication sur le site ou l’application. L’Utilisateur est invité à consulter régulièrement les CGU.
      </p>

      <h2 className="text-xl font-semibold mt-4">12. Résiliation</h2>
      <p>
        L’Utilisateur peut supprimer son compte à tout moment via l’interface prévue à cet effet.<br />
        DogWalk peut suspendre ou supprimer un compte en cas de non-respect des présentes CGU, sans préavis.
      </p>

      <h2 className="text-xl font-semibold mt-4">13. Droit applicable</h2>
      <p>
        Les présentes CGU sont régies par le droit français.<br />
        Tout litige relatif à leur interprétation ou leur exécution relève des juridictions compétentes du ressort du siège social de DogWalk.
      </p>

      {onBack && (
        <button
          className="mt-8 w-full bg-primary-green text-primary-brown rounded hover:bg-primary-brown hover:text-white transition-colors"
          onClick={onBack}
        >
          Retour
        </button>
      )}
    </section>
  );
}
