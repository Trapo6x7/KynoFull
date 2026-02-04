import { UserData } from "../types/Interfaces";

type ProfileCardProps = {
  title?: string;
  description?: string;
  headerContent?: React.ReactNode;
  children?: React.ReactNode;
  footerContent?: React.ReactNode;
  userData?: UserData;
  customClass?: string;
};


export function ProfileCard({
  title,
  description,
  headerContent,
  children,
  footerContent,
  customClass = "",
}: ProfileCardProps) {
  return (
    <article
      className={`w-full rounded-lg bg-[#FBFFEE] backdrop-blur-sm overflow-hidden pt-2 ${customClass}`}
      role="region"
      aria-label={title ? `Carte profil : ${title}` : "Carte profil utilisateur"}
    >
      <header className="p-3 flex flex-col items-center gap-2 text-center">
        <div className="w-full text-center">
          {headerContent}
          {title && (
            <h2 className="text-lg font-medium text-secondary-brown w-full mb-0.5" id="profile-card-title">{title}</h2>
          )}
          {description && (
            <p className="text-xs text-[rgba(218,145,93,0.8)] w-full" aria-describedby="profile-card-title">{description}</p>
          )}
        </div>
      </header>
      {children && <section className="p-0" aria-label="Contenu principal de la carte profil">{children}</section>}
      {footerContent && (
        <footer className="flex justify-end p-0 w-full" aria-label="Actions carte profil">{footerContent}</footer>
      )}
    </article>
  );
}
