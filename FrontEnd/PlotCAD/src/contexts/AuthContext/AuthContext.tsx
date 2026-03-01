import { createContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthApi from "../../api/Auth";
import UserApi from "../../api/User";
import Loading from "../../components/Loading";
import { IUserResponse } from "../../types/users.types";
import { AuthContextType, AuthProviderProps, IUser } from "./AuthContex.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<IUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
	const { getCurrentUser } = UserApi();
	const { logout } = AuthApi();

	const navigate = useNavigate();
	const isAuthenticated = useMemo(() => !!user, [user]);

	const handleLogout = async () => {
		await logout();
		setUser(null);
		navigate("/");
	};

	useEffect(() => {
		const onUnauthorized = () => {
			setUser(null);
			navigate("/");
		};
		window.addEventListener("auth:unauthorized", onUnauthorized);
		return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
	}, [navigate]);

	useEffect(() => {
		const fetchCurrentUser = async () => {
			const userResponse = await getCurrentUser();

			if (userResponse.success && userResponse.data) {
				const data = userResponse.data as IUserResponse;
				setUser({ id: data.id, role: data.role });
			} else if (userResponse.httpStatus === 402) {
				setSubscriptionError(userResponse.message);
			} else {
				await handleLogout();
			}

			setLoading(false);
		};
		fetchCurrentUser();
	}, []);

	const setCurrentUser = (user: IUserResponse) => {
		setUser({
			id: user.id,
			role: user.role,
		});
	};

	const renderContent = () => {
		if (loading) return <Loading />;
		if (subscriptionError) {
			return (
				<div className="flex items-center justify-center h-screen bg-neutral-100">
					<div className="flex flex-col items-center gap-4 w-[420px] bg-gray-50 shadow-[0_10px_20px_rgba(0,0,0,0.15)] rounded-2xl p-8 text-center">
						<p className="text-lg font-semibold text-red-600">{subscriptionError}</p>
						<button
							onClick={handleLogout}
							className="bg-primary-light text-white py-2 px-6 rounded-md font-semibold hover:bg-primary transition-all duration-200"
						>
							Back to Login
						</button>
					</div>
				</div>
			);
		}
		return children;
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				subscriptionError,
				setCurrentUser,
				handleLogout,
				refreshUser: async () => {},
			}}
		>
			{renderContent()}
		</AuthContext.Provider>
	);
};

export default AuthContext;
