import { useState } from "react";
import { FiLogOut, FiUsers } from "react-icons/fi";
import { HiHome } from "react-icons/hi";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../contexts/hooks/useAuth";
import SideBar from "../SideBar/SideBar";
import { ISideBarItem } from "../SideBar/SideBar.types";
import Header from "./Header";
import { Building2, Puzzle, ScrollText } from "lucide-react";

const Layout: React.FC = () => {
	const { handleLogout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
	const toggleSidebar = () => setIsSidebarOpen((prev: boolean) => !prev);

	const sideBarItems: ISideBarItem[] = [
		{
			text: "Dashboard",
			icon: <HiHome size={24} />,
			selected: location.pathname === "/dashboard",
			onClick: () => {
				toggleSidebar();
				navigate("/dashboard");
			},
		},
		{
			text: "Tenants",
			icon: <Building2 size={22} />,
			selected: location.pathname.startsWith("/tenants"),
			onClick: () => {
				toggleSidebar();
				navigate("/tenants");
			},
		},
		{
			text: "Usuários",
			icon: <FiUsers size={22} />,
			selected: location.pathname.startsWith("/users"),
			onClick: () => {
				toggleSidebar();
				navigate("/users");
			},
		},
		{
			text: "Módulos",
			icon: <Puzzle size={22} />,
			selected: location.pathname.startsWith("/modules"),
			onClick: () => {
				toggleSidebar();
				navigate("/modules");
			},
		},
		{
			text: "Audit Log",
			icon: <ScrollText size={22} />,
			selected: location.pathname.startsWith("/audit"),
			onClick: () => {
				toggleSidebar();
				navigate("/audit");
			},
		},
		{
			text: "Logout",
			icon: <FiLogOut size={22} />,
			onClick: handleLogout,
		},
	];

	return (
		<div className="w-screen h-screen overflow-hidden bg-gray-50">
			<Header onToggleSidebar={toggleSidebar} isSideBarOpen={isSidebarOpen} />
			<SideBar items={sideBarItems} open={isSidebarOpen} />

			<main className="flex-1 pt-16 overflow-auto h-screen">
				<Outlet />
			</main>
		</div>
	);
};

export default Layout;
