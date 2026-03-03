import React, { createContext, useContext, useMemo, ReactNode } from 'react';

import authService from '../services/authService';
import { userService } from '../services/userService';
import matchService from '../services/matchService';
import dogService from '../services/dogService';
import walkService from '../services/walkService';
import chatService from '../services/chatService';

import type { IAuthService } from '../services/interfaces/IAuthService';
import type { IUserService } from '../services/interfaces/IUserService';
import type { IMatchService } from '../services/interfaces/IMatchService';
import type { IDogService } from '../services/interfaces/IDogService';
import type { IWalkService } from '../services/interfaces/IWalkService';
import type { IChatService } from '../services/interfaces/IChatService';

// ─── Contrat du contexte (DIP : dépend des abstractions) ─────────────────────
export interface ServicesContextType {
  authService: IAuthService;
  userService: IUserService;
  matchService: IMatchService;
  dogService: IDogService;
  walkService: IWalkService;
  chatService: IChatService;
}

const ServicesContext = createContext<ServicesContextType | null>(null);

// ─── Hook consommateur ────────────────────────────────────────────────────────
export const useServices = (): ServicesContextType => {
  const ctx = useContext(ServicesContext);
  if (!ctx) {
    throw new Error('useServices doit être utilisé à l\'intérieur d\'un ServicesProvider');
  }
  return ctx;
};

// ─── Provider — injecte les implémentations concrètes ────────────────────────
// Pour les tests, remplacer les implémentations par des mocks via la prop `services`.
interface ServicesProviderProps {
  children: ReactNode;
  /** Override partiel pour les tests (injection de mocks) */
  services?: Partial<ServicesContextType>;
}

const defaultServices: ServicesContextType = {
  authService,
  userService,
  matchService,
  dogService,
  walkService,
  chatService,
};

export const ServicesProvider: React.FC<ServicesProviderProps> = ({
  children,
  services,
}) => {
  const value = useMemo<ServicesContextType>(
    () => ({ ...defaultServices, ...services }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [services]
  );

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};

export default ServicesContext;
