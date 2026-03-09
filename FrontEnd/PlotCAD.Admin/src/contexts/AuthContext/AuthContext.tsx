import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../api/Auth";
import Loading from "../../components/Loading/Loading";
import { IManager } from "../../types/auth.types";
import { AuthContextType, AuthProviderProps } from "./AuthContext.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [manager, setManager] = useState<IManager | null>(null);
	const [loading, setLoading] = useState(true);
	const { logout, me } = AuthApi();

	const navigate = useNavigate();
	const isAuthenticated = useMemo(() => !!manager, [manager]);

	const handleLogout = async () => {
		await logout();
		setManager(null);
		navigate("/");
	};

	useEffect(() => {
		const onUnauthorized = () => {
			setManager(null);
			navigate("/");
		};
		window.addEventListener("auth:unauthorized", onUnauthorized);
		return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
	}, [navigate]);

	useEffect(() => {
		const fetchCurrentManager = async () => {
			const response = await me();

			if (response.success && response.data) {
				setManager(response.data);
			} else {
				setManager(null);
			}

			setLoading(false);
		};
		fetchCurrentManager();
	}, []);

	const setCurrentManager = (m: IManager) => {
		setManager(m);
	};

	if (loading) return <Loading />;

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				manager,
				setCurrentManager,
				handleLogout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
