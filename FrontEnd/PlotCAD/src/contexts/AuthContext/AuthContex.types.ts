import { ReactNode } from "react";
import { IUserResponse } from "../../types/users.types";

export interface IUser {
  id: number;
	role: string;
}

export interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
	setCurrentUser: (user: IUserResponse) => void;
  handleLogout: () => void;
  refreshUser: () => Promise<void>;
}

export interface AuthProviderProps {
	children: ReactNode;
}