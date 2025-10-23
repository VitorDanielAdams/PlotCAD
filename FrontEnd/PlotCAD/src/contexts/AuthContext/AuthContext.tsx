import { createContext, useEffect, useState } from "react";
import { AuthContextType, AuthProviderProps, User } from "./AuthContex.types";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { IUserResponseDto } from "../../types/users.types";
import UserApi from "../../api/User";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);		
	const { getCurrentUser } = UserApi();

	const navigate = useNavigate();
	const isAuthenticated = !!user;

	useEffect(() => {
		const fetchCurrentUser = async () => {
			if (user === null) {
				const userResponse = await getCurrentUser();
				if (userResponse.success && userResponse.data !== null) {
					setUser({
						id: (userResponse.data as IUserResponseDto).Id,
						email: (userResponse.data as IUserResponseDto).Email,
						name: (userResponse.data as IUserResponseDto).Name,
						role: (userResponse.data as IUserResponseDto).Role
					});
				}
			}
		};
		fetchCurrentUser();
	}, []);

	const setCurrentUser = (user: IUserResponseDto) => {
		setUser({
			id: user.Id,
			email: user.Email,
			name: user.Name,
			role: user.Role
		});
	};

	const logout = () => {
    setUser(null);
    navigate("/");
	};

	return (
		<AuthContext.Provider
			value={{ 
				isAuthenticated, 
				user, 
				setCurrentUser,
				logout, 
				refreshUser: async () => {}
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;