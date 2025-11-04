import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { AuthProvider } from "../contexts/AuthContext/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Login";
import HomePage from "../pages/HomePage";
import Loading from "../components/Loading/Loading";
import Layout from "../components/Layout";

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
							<Route path="/v1" element={<Layout />} >
								<Route path="home" index element={<HomePage />} />
							</Route>
						</Route>
					</Routes>
				</Suspense>
			</AuthProvider>
		</BrowserRouter>
);
}