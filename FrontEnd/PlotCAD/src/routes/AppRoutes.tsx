import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import HomePage from "../pages/HomePage";
import { AuthProvider } from "../contexts/AuthContext/AuthContext";
import Loading from "../components/Loading/Loading";

export function AppRoutes() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Suspense
					fallback={
						<div className="w-screen h-screen flex items-center justify-center">
							<Loading />
						</div>
					}
				>

					<Routes>
						<Route path="/" element={<Login />} />
						<Route element={<ProtectedRoute />}>
							<Route path="/home" element={<HomePage />} />
						</Route>
					</Routes>
				</Suspense>
			</AuthProvider>
		</BrowserRouter>
);
}