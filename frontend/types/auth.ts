export interface UserType {
  uid: string;
  email: string | null;
  name: string;
  securityMethod: 'pin' | 'faceId' | null;
  emailVerified: boolean;
  pin: string | null;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  login: (email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; msg?: string }>;
  token: string | null;
  unlocked: boolean;
  unlock: () => void;
  loading: boolean;
  setSecurityMethod: (method: 'faceId') => Promise<void>;
}