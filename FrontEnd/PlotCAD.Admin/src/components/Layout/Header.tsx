import { HiMenuAlt3 } from "react-icons/hi";

interface IHeaderProps {
	onToggleSidebar: () => void;
	isSideBarOpen: boolean;
}

const Header = ({ onToggleSidebar }: IHeaderProps) => {
	return (
		<header className="fixed top-0 left-0 right-0 h-16 bg-primary flex items-center justify-between px-6 z-50">
			<div className="flex items-center gap-3">
				<span className="text-white text-lg font-bold tracking-wide">PlotCAD Admin</span>
			</div>
			<button onClick={onToggleSidebar} className="text-white p-2 hover:bg-white/10 rounded transition-colors">
				<HiMenuAlt3 size={24} />
			</button>
		</header>
	);
};

export default Header;
