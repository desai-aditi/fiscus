// types/auth.ts
export interface UserType {
  uid: string;
  email: string | null;
  name: string;
  securityMethod: 'faceId' | 'pin' | null;
  pin: string | null;
}

export interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; msg?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; msg?: string }>;
  token: string | null;
  needsSecurityVerification: boolean;
  setSecurityMethod: (method: 'faceId' | 'pin', pin?: string) => Promise<{ success: boolean; msg?: string }>;
  verifySecurityMethod: (input?: string) => Promise<{ success: boolean; msg?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; msg?: string }>;
  resetPassword: (oobCode: string, newPassword: string) => Promise<{ success: boolean; msg?: string }>;
}