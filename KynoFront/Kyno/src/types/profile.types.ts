export type ProfileMode = 'me' | 'preview' | 'match' | 'group';
export type ProfileType = 'owner' | 'pet';
export type ProfileTab = 'images' | 'apropos';

export interface BaseProfileData {
  name: string;
  images: string[];
  keywords: string[];
  description?: string;
}

export interface MeProfileProps extends BaseProfileData {
  mode: 'me';
  type: ProfileType;
  onBack: () => void;
  onEdit: () => void;
  onSettings: () => void;
  onAddImage: () => void;
  onSubProfile?: () => void;
  subProfileIcon?: string;
  subProfileLabel?: string;
}

export interface PreviewProfileProps extends BaseProfileData {
  mode: 'preview';
  type: ProfileType;
  mainImage: string;
  onBack: () => void;
  onLike: () => void;
  onDislike: () => void;
  onNext: () => void;
  onSubProfile?: () => void;
  subProfileIcon?: string;
  subProfileLabel?: string;
}

export interface MatchProfileProps extends BaseProfileData {
  mode: 'match';
  type: ProfileType;
  onBack: () => void;
  onMessage: () => void;
}

export interface GroupProfileProps extends BaseProfileData {
  mode: 'group';
  members: { id: number; name: string }[];
  onBack: () => void;
  onAddMember?: () => void;
  onChat?: () => void;
}

export type ProfileViewProps = 
  | MeProfileProps 
  | PreviewProfileProps 
  | MatchProfileProps 
  | GroupProfileProps;
