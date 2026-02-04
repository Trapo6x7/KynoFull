import React, { useState } from 'react';

interface GroupCreateFormProps {
  onCreateGroup: (name: string, description: string, mixed: boolean) => void;
}

const GroupCreateForm: React.FC<GroupCreateFormProps> = ({ onCreateGroup }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mixed, setMixed] = useState(true);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (name && description) {
      onCreateGroup(name, description, mixed);
      setName('');
      setDescription('');
      setMixed(true);
    }
  };
  return (
    <section className="w-full flex flex-col items-center" aria-label="Section création de groupe">
      <article className="bg-[#FBFFEE] rounded-lg shadow-lg w-full md:h-80 mx-auto p-2 md:p-4 flex flex-col justify-between" aria-label="Carte création de groupe">
        {/* Mobile: Accordion */}
        <div className="block md:hidden w-full">
          <details className="w-full max-w-md mx-auto">
            <summary className="flex flex-col items-center gap-2 cursor-pointer select-none px-4 pt-2 pb-0 w-full max-w-md mx-auto">
              <h2 className="text-lg font-bold text-secondary-brown uppercase text-center mb-2">Créer un groupe</h2>
            </summary>
            <form className="flex flex-col gap-2 mt-4 px-2 pb-2" onSubmit={handleSubmit} aria-label="Créer un groupe" role="form">
              <div className="relative w-full">
                <input
                  id="group-name"
                  type="text"
                  placeholder=" "
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="peer p-2 rounded-md border border-[rgba(123,78,46,0.2)] text-sm w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                  aria-required="true"
                />
                <label
                  htmlFor="group-name"
                  className="absolute left-2 top-2 text-secondary-brown text-sm pointer-events-none transition-all
                    peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm
                    peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--primary-green)]"
                >
                  Nom du groupe
                </label>
              </div>
              <div className="relative w-full">
                <textarea
                  id="group-description"
                  placeholder=" "
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="peer p-2 rounded-md border border-[rgba(123,78,46,0.2)] text-sm min-h-[80px] w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                  aria-required="true"
                />
                <label
                  htmlFor="group-description"
                  className="absolute left-2 top-2 text-secondary-brown text-sm pointer-events-none transition-all
                    peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm
                    peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--primary-green)]"
                >
                  Description
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mixed"
                  checked={mixed}
                  onChange={(e) => setMixed(e.target.checked)}
                  className="accent-[var(--primary-green)]"
                  aria-checked={mixed}
                  aria-label="Groupe mixte"
                />
                <label htmlFor="mixed" className="text-sm text-secondary-brown">Mixte</label>
              </div>
              <button
                type="submit"
                className="bg-[var(--primary-green)] text-[var(--primary-brown)] w-full rounded-md px-4 py-2 font-medium text-sm hover:bg-[#B7D336] transition border-none cursor-pointer mt-2"
                aria-label="Créer le groupe"
              >
                Créer un groupe
              </button>
            </form>
          </details>
        </div>
        {/* Desktop: Form always visible */}
        <div className="hidden md:block w-full max-w-md mx-auto my-4">
          <h2 className="text-xl font-bold text-secondary-brown uppercase text-center pb-4">Créer un groupe</h2>
          <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit} aria-label="Créer un groupe" role="form">
            <div className="relative w-full">
              <input
                id="group-name-desktop"
                type="text"
                placeholder=" "
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer p-2 rounded-md border border-[rgba(123,78,46,0.2)] text-base w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                aria-required="true"
              />
              <label
                htmlFor="group-name-desktop"
                className="absolute left-2 top-2 text-secondary-brown text-base pointer-events-none transition-all
                  peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
                  peer-focus:top-0 peer-focus:text-sm peer-focus:text-[var(--primary-green)]"
              >
                Nom du groupe
              </label>
            </div>
            <div className="relative w-full">
              <textarea
                id="group-description-desktop"
                placeholder=" "
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="peer p-2 rounded-md border border-[rgba(123,78,46,0.2)] text-base min-h-[80px] w-full focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                aria-required="true"
              />
              <label
                htmlFor="group-description-desktop"
                className="absolute left-2 top-2 text-secondary-brown text-base pointer-events-none transition-all
                  peer-placeholder-shown:top-2 peer-placeholder-shown:text-base
                  peer-focus:top-0 peer-focus:text-sm peer-focus:text-[var(--primary-green)]"
              >
                Description
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mixed-desktop"
                checked={mixed}
                onChange={(e) => setMixed(e.target.checked)}
                className="accent-[var(--primary-green)]"
                aria-checked={mixed}
                aria-label="Groupe mixte"
              />
              <label htmlFor="mixed-desktop" className="text-base text-secondary-brown">Mixte</label>
            </div>
            <button
              type="submit"
              className="bg-[var(--primary-green)] text-[var(--primary-brown)] w-full rounded-md px-4 py-2 font-medium text-base hover:bg-[#B7D336] transition border-none cursor-pointer mt-2"
              aria-label="Créer le groupe"
            >
              Créer un groupe
            </button>
          </form>
        </div>
      </article>
    </section>
  );
};

export default GroupCreateForm;
