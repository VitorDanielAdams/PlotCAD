import { Layers, PlaneTakeoff, Radio } from "lucide-react";
import { memo } from "react";

export type MapMode = "layers" | "flight" | "ntrip";

interface MapModeControlsProps {
	activeMode: MapMode;
	onModeChange: (mode: MapMode) => void;
	layersActiveCount: number;
}

interface ModeButtonProps {
	icon: React.ReactNode;
	label: string;
	isActive: boolean;
	badge?: number;
	onClick: () => void;
}

function ModeButton({ icon, label, isActive, badge, onClick }: ModeButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={label}
			className={`relative flex items-center justify-center w-9 h-9 rounded-lg shadow-md border transition-colors ${
				isActive
					? "bg-[#15803d] border-[#15803d] text-white hover:bg-[#166534]"
					: "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
			}`}
		>
			{icon}
			{badge !== undefined && badge > 0 && !isActive && (
				<span className="absolute -top-1 -right-1 w-4 h-4 bg-[#15803d] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
					{badge}
				</span>
			)}
		</button>
	);
}

export default memo(function MapModeControls({
	activeMode,
	onModeChange,
	layersActiveCount,
}: MapModeControlsProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<ModeButton
				icon={<Layers className="w-4 h-4" />}
				label="Camadas (CAR / SIGEF / SNCI)"
				isActive={activeMode === "layers"}
				badge={layersActiveCount}
				onClick={() => onModeChange("layers")}
			/>
			<ModeButton
				icon={<PlaneTakeoff className="w-4 h-4" />}
				label="Restrição de Voo (DECEA)"
				isActive={activeMode === "flight"}
				onClick={() => onModeChange("flight")}
			/>
			<ModeButton
				icon={<Radio className="w-4 h-4" />}
				label="Estações NTRIP (RBMC/IBGE)"
				isActive={activeMode === "ntrip"}
				onClick={() => onModeChange("ntrip")}
			/>
		</div>
	);
});
