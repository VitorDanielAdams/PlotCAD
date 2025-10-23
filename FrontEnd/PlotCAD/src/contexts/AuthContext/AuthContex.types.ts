import { ReactNode } from "react";
import { IUserResponseDto } from "../../types/users.types";

export interface User {
  id: number;
  name: string;
	email: string;
	role: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
	setCurrentUser: (user: IUserResponseDto) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
	children: ReactNode;
}