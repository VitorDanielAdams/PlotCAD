import React from "react";
import SideBarItem from "./components/SideBarItem/SideBarItem";
import { ISideBarProps } from "./SideBar.types";

const SideBar: React.FC<ISideBarProps> = (props: ISideBarProps) => {
	const { open, items } = props;

	return (
		<>
			<div
				className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
					open ? "opacity-100 visible" : "opacity-0 invisible"
				}`}
			/>

			<div
				className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200
          z-[60] flex flex-col justify-between transition-transform duration-300 ease-in-out
					mt-14 w-[25vw] min-w-[300px]
          ${open ? "translate-x-0" : "translate-x-full"}`}
			>
				<div className="flex flex-col gap-3 p-6">
					{items.map((item, index) =>
						item.onRender ? (
							item.onRender(index)
						) : (
							<SideBarItem
								key={index}
								text={item.text}
								icon={item.icon}
								selected={item.selected}
								classname={item.classname}
								onClick={item.onClick}
							/>
						),
					)}
				</div>
			</div>
		</>
	);
};

export default SideBar;
