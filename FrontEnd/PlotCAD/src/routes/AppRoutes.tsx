import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import Loading from "../components/Loading/Loading";
import { AuthProvider } from "../contexts/AuthContext/AuthContext";
import HomePage from "../pages/HomePage";
import LandDraw from "../pages/LandDraw";
import LandRegistration from "../pages/LandRegistration";
import Login from "../pages/Login";
import ProtectedRoute from "./ProtectedRoute";

export function AppRoutes() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path="/" element={<Login />} />
						<Route element={<ProtectedRoute />}>
							<Route path="/v1" element={<Layout />}>
								<Route path="home" index element={<HomePage />} />
								<Route path="matriculas" element={<LandRegistration />} />
								<Route path="nova-matricula" element={<LandDraw />} />
								{/* <Route path="relatorios" element={<HomePage />} /> */}
							</Route>
						</Route>
					</Routes>
				</Suspense>
			</AuthProvider>
		</BrowserRouter>
	);
}
