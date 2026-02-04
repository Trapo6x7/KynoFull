import React from 'react';


interface FooterProps {
  onShowTerms?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onShowTerms }) => {
  return (
    <footer className="flex flex-col items-center justify-center gap-2">
      {/* <div className="flex items-center justify-center gap-10">
        <a href="#" aria-label="Lien vers Instagram" tabIndex={0}>
          <img src='/socialicon1.png' alt='Instagram' />
        </a>
        <a href="#" aria-label="Lien vers Facebook" tabIndex={0}>
          <img src='/socialicon2.png' alt='Facebook' />
        </a>
        <a href="#" aria-label="Lien vers Twitter" tabIndex={0}>
          <img src='/socialincon3.png' alt='Twitter' />
        </a>
        <a href="#" aria-label="Lien vers LinkedIn" tabIndex={0}>
          <img src='/socialicon4.png' alt='LinkedIn' />
        </a>
      </div> */}
      <a
        href="#cgu"
        onClick={e => { e.preventDefault(); onShowTerms && onShowTerms(); }}
        aria-label="Voir les conditions générales d'utilisation"
        role="button"
        tabIndex={0}
        className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-green rounded bg-primary-green text-primary-brown text-xs hover:bg-primary-brown hover:text-white transition-colors"
      >
        Conditions générales d'utilisation
      </a>
    </footer>
  );
};

export default Footer;