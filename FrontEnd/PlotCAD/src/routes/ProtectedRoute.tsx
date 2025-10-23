import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../contexts/hooks/useAuth";

const ProtectedRoute = () => {
	const { isAuthenticated } = useAuth();

	return isAuthenticated ? <Outlet /> : <Navigate to={"/"} />;
};

export default ProtectedRoute;