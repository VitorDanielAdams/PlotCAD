import React, { useState } from "react";
import { FaUserFriends, FaVectorSquare } from "react-icons/fa";
import { FiLogOut, FiUsers } from "react-icons/fi";
import { HiHome } from "react-icons/hi";
import { TbRulerMeasure } from "react-icons/tb";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../contexts/hooks/useAuth";
import Header from "../Header";
import SideBar from "../SideBar";
import { ISideBarItem } from "../SideBar/SideBar.types";

const Layout: React.FC = () => {
	const { handleLogout, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const prefix = "/v1";

	const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
	const toggleSidebar = () => setIsSidebarOpen((prev: boolean) => !prev);

	const isAdmin = user?.role === "Admin";
	const isAdminOrManager = user?.role === "Admin" || user?.role === "Manager";

	const sideBarItems: ISideBarItem[] = [
		{
			text: "Home",
			icon: <HiHome size={24} />,
			selected: location.pathname === `${prefix}/home`,
			onClick: () => {
				toggleSidebar();
				navigate(`${prefix}/home`);
			},
		},
		{
			text: "Matrículas",
			icon: <FaVectorSquare size={22} />,
			selected: location.pathname === `${prefix}/matriculas`,
			onClick: () => {
				toggleSidebar();
				navigate(`${prefix}/matriculas`);
			},
		},
		{
			text: "Nova Matrícula",
			icon: <TbRulerMeasure size={22} />,
			selected: location.pathname === `${prefix}/nova-matricula`,
			onClick: () => {
				toggleSidebar();
				navigate(`${prefix}/nova-matricula`);
			},
		},
		...(isAdmin
			? [
					{
						text: "Usuários",
						icon: <FiUsers size={22} />,
						selected: location.pathname === `${prefix}/usuarios`,
						onClick: () => {
							toggleSidebar();
							navigate(`${prefix}/usuarios`);
						},
					},
				]
			: []),
		...(isAdminOrManager
			? [
					{
						text: "Funcionários",
						icon: <FaUserFriends size={22} />,
						selected: location.pathname === `${prefix}/funcionarios`,
						onClick: () => {
							toggleSidebar();
							navigate(`${prefix}/funcionarios`);
						},
					},
				]
			: []),
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

			<main className="flex-1 pt-16 overflow-hidden relative z-10">
				<Outlet />
			</main>
		</div>
	);
};

export default Layout;
