import type { ReactNode } from "react";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface IModalProps {
	isOpen: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
	subtitle?: string;
	footer?: ReactNode;
	size?: ModalSize;
}
