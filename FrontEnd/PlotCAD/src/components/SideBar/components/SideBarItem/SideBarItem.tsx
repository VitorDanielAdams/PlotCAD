import { ISiderBarItemProps } from "./SideBarItem.types";

const SideBarItem = (props: ISiderBarItemProps) => {
	return (
		<div
			className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer 
				transition-all duration-300 ease-in-out
				${props.selected 
					? "bg-green-500 text-white shadow-sm" 
					: "text-gray-700 hover:bg-gray-100"
				}
				${props.classname || ""}
			`}
			onClick={props.onClick}
		>
			{props.icon && (
				<span className={`text-xl ${props.selected ? "text-white" : "text-green-500"}`}>
					{props.icon}
				</span>
			)}
			<span className="font-medium text-sm hidden lg:block">{props.text}</span>
		</div>
	);
};

export default SideBarItem;