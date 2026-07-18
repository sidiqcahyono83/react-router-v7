import { createContext } from "react";
import type { User } from "~/types/typeData";

export interface AuthContextType {
  user: User | null;
  initialized: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
