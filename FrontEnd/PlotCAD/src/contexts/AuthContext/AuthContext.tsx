import { createContext, useEffect, useState } from "react";
import { AuthContextType, AuthProviderProps, User } from "./AuthContex.types";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { IUserResponseDto } from "../../types/users.types";
import UserApi from "../../api/User";
import Loading from "../../components/Loading";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const { getCurrentUser } = UserApi();

	const navigate = useNavigate();
	const isAuthenticated = !!user;

	useEffect(() => {
		const fetchCurrentUser = async () => {
			const token = Cookies.get("token");
			if (token) {
        setLoading(false);
        return;
      }

			try {
        const userResponse = await getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const data = userResponse.data as IUserResponseDto;
          setUser({ id: data.Id, role: data.Role });
        } else {
          Cookies.remove("token");
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
        Cookies.remove("token");
      } finally {
        setLoading(false);
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

	const logout = () => {
		Cookies.remove("token");
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
			{loading ? (
        <Loading />
      ) : (
        children
      )}
		</AuthContext.Provider>
	);
};

export default AuthContext;