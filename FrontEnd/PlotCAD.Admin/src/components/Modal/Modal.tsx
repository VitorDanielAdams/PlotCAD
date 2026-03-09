import { X } from "lucide-react";
import { useEffect } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl";

interface IModalProps {
	isOpen: boolean;
	title: string;
	subtitle?: string;
	onClose: () => void;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: ModalSize;
}

const sizeClass: Record<ModalSize, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
};

const Modal = ({ isOpen, title, subtitle, onClose, children, footer, size = "md" }: IModalProps) => {
	useEffect(() => {
		if (!isOpen) return;

		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClass[size]} mx-4`}>
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
					<div>
						<h2 className="text-sm font-semibold text-gray-900">{title}</h2>
						{subtitle && (
							<p className="text-xs text-gray-400 mt-0.5 truncate max-w-[320px]">{subtitle}</p>
						)}
					</div>
					<button
						onClick={onClose}
						className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="px-5 py-4">{children}</div>

				{footer && (
					<div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
};

export default Modal;
