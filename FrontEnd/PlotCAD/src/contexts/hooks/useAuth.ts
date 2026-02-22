import { useContext } from "react";
import AuthContext from "../AuthContext/AuthContext";

const useAuth = () => {
	const authData = useContext(AuthContext);

	if (!authData) {
		throw new Error("useAuth must be used within an AuthProvider");
	}

	return authData;
};

export default useAuth;
