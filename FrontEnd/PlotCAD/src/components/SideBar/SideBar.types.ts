import { JSX, ReactNode } from "react";

export interface ISideBarItem {
	text: string;
	icon?: JSX.Element;
	selected?: boolean;
	classname?: string;
	onClick?: () => void;
	onRender?: (key: number | string) => ReactNode | string | number;
}

export interface ISideBarProps {
	items: ISideBarItem[];
	open: boolean;
}