import logo from "/logo.png";
import { IHeaderProps } from "./Header.types";
import { HiMenuAlt3 } from "react-icons/hi";
import { FiX } from "react-icons/fi";

const Header: React.FC<IHeaderProps> = (props: IHeaderProps) => {
	const { onToggleSidebar, isSideBarOpen } = props;

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-[50] flex items-center justify-between px-6 py-3">
				<div className="flex items-center gap-2">
					<img
						src={logo}
						alt="Logo"
						className="h-8"
					/>
					<h1 className="text-lg font-semibold text-gray-700">PLOTCAD</h1>
				</div>

        <button
					onClick={onToggleSidebar}
					className="text-gray-600 hover:text-gray-900 transition rounded-md z-[70]"
				>
					{isSideBarOpen ? <FiX size={26} /> : <HiMenuAlt3 size={26} />}
				</button>
			</header>
    </>
  );
}

export default Header;