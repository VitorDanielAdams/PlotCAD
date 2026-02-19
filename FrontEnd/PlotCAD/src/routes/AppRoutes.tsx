import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "../contexts/AuthContext/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import HomePage from "../pages/HomePage";
import Loading from "../components/Loading/Loading";
import Layout from "../components/Layout";
import LandRegistration from "../pages/LandRegistration"
import LandDraw from "../pages/LandDraw";

export function AppRoutes() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Suspense
					fallback={
						<Loading />
					}
				>
					<Routes>
						<Route path="/" element={<Login />} />
						<Route element={<ProtectedRoute />}>
							<Route path="/v1" element={<Layout />} >
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