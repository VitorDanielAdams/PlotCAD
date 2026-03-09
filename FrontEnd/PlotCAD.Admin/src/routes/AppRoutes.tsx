import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import Loading from "../components/Loading/Loading";
import { AuthProvider } from "../contexts/AuthContext/AuthContext";
import AuditLogsPage from "../pages/AuditLogs/AuditLogsPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import ModulesPage from "../pages/Modules/ModulesPage";
import TenantsPage from "../pages/Tenants/TenantsPage";
import TenantDetailPage from "../pages/Tenants/TenantDetailPage";
import UsersPage from "../pages/Users/UsersPage";
import ProtectedRoute from "./ProtectedRoute";

export function AppRoutes() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route path="/" element={<Login />} />
						<Route element={<ProtectedRoute />}>
							<Route element={<Layout />}>
								<Route path="dashboard" element={<Dashboard />} />
								<Route path="tenants" element={<TenantsPage />} />
								<Route path="tenants/:id" element={<TenantDetailPage />} />
								<Route path="users" element={<UsersPage />} />
								<Route path="modules" element={<ModulesPage />} />
								<Route path="audit" element={<AuditLogsPage />} />
							</Route>
						</Route>
					</Routes>
				</Suspense>
			</AuthProvider>
		</BrowserRouter>
	);
}
