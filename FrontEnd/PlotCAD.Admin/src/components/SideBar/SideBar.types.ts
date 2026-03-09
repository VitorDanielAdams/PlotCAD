import { ReactNode } from "react";

export interface ISideBarItem {
	text: string;
	icon: ReactNode;
	selected?: boolean;
	onClick: () => void;
}
