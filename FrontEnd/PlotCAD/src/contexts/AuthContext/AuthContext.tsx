import { createContext, useEffect, useMemo, useState } from "react";
import { AuthContextType, AuthProviderProps, User } from "./AuthContex.types";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { IUserResponseDto } from "../../types/users.types";
import UserApi from "../../api/User";
import Loading from "../../components/Loading";
import AuthApi from "../../api/Auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const { getCurrentUser } = UserApi();
	const { logout } = AuthApi();

	const navigate = useNavigate();
	const isAuthenticated = useMemo(() => !!user, [user]);

	useEffect(() => {
		const fetchCurrentUser = async () => {
			try {
        const userResponse = await getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const data = userResponse.data as IUserResponseDto;
          return setUser({ id: data.Id, role: data.Role });
        } else {
          return await handleLogout();
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        return await handleLogout();
				;
      } finally {
        return setLoading(false);
      }
		};
		fetchCurrentUser();
	}, []);

	const setCurrentUser = (user: IUserResponseDto) => {
		setUser({
			id: user.Id,
			role: user.Role
		});
	};

	const  handleLogout = async () => {
		const result = await logout();
		if (result.success) {
			setUser(null);
		}
    navigate("/");
	};

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				setCurrentUser,
				handleLogout,
				refreshUser: async () => {}
			}}
		>
			{loading ? (
        <Loading />
      ) : (
        children
      )}
		</AuthContext.Provider>
	);
};

export default AuthContext;