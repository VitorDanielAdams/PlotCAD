import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import { ISideBarItem } from '../SideBar/SideBar.types';
import { HiHome } from "react-icons/hi";
import { VscGraph } from "react-icons/vsc";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import SideBar from '../SideBar';
import { useLocation, useNavigate } from "react-router-dom";
import { FaVectorSquare } from "react-icons/fa";

const Layout: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const prefix = "/v1"

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

	const sideBarItems: ISideBarItem[] = [
		{
			text: "Home",
			icon: <HiHome size={24} />,
			selected: location.pathname === `${prefix}/home`,
			onClick: () => navigate(`${prefix}/home`),
		},
		{
			text: "Matrículas",
			icon: <FaVectorSquare size={22} />,
			selected: location.pathname === `${prefix}/matriculas`,
			onClick: () => navigate(`${prefix}/matriculas`),
		},
		{
			text: "Dashboards",
			icon: <VscGraph size={22} />,
			selected: location.pathname === `${prefix}/dashboards`,
			onClick: () => navigate(`${prefix}/dashboards`),
		},
		{
			text: "Perfil",
			icon: <FaUserCircle size={22} />,
			selected: location.pathname === `${prefix}/dashboards`,
			onClick: () => navigate(`${prefix}/dashboards`),
		},
		{
			text: "Logout",
			icon: <FiLogOut size={22} />,
			// onClick: logout,
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