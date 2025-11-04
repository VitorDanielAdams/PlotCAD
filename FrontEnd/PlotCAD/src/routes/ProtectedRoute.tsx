import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../contexts/hooks/useAuth";
import Loading from "../components/Loading";

const ProtectedRoute = () => {
	const { isAuthenticated, user } = useAuth();

  if (user === null && !isAuthenticated)
		return <Loading />

	return isAuthenticated ? <Outlet /> : <Navigate to={"/"} />;
};

export default ProtectedRoute;