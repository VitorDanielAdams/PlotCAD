import { ReactNode } from "react";
import { IManager } from "../../types/auth.types";

export interface AuthContextType {
	manager: IManager | null;
	isAuthenticated: boolean;
	setCurrentManager: (manager: IManager) => void;
	handleLogout: () => void;
}

export interface AuthProviderProps {
	children: ReactNode;
}
