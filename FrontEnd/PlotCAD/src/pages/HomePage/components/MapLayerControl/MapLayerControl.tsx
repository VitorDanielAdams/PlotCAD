import L from "leaflet";
import { Eye, EyeOff, Layers, X } from "lucide-react";
import { memo, useEffect, useRef } from "react";
import { LAYER_GROUPS, MAP_LAYERS } from "../../../../config/mapLayers";
import type { MapLayerConfig } from "../../../../types/map.types";

interface MapLayerControlProps {
	activeLayers: Set<string>;
	onToggle: (layerId: string) => void;
	zoomTooLow: boolean;
	maxLayersReached: boolean;
	isExpanded: boolean;
	onToggleExpanded: () => void;
}

function LayerItem({
	layer,
	isActive,
	onToggle,
	zoomTooLow,
}: {
	layer: MapLayerConfig;
	isActive: boolean;
	onToggle: () => void;
	zoomTooLow: boolean;
}) {
	const showDisabled = zoomTooLow && isActive;

	return (
		<button
			type="button"
			onClick={onToggle}
			className={`flex items-center gap-2 w-full px-3 py-2 text-left transition-all ${
				isActive ? "bg-gray-50" : "hover:bg-gray-50/50"
			}`}
		>
			<span
				className={`w-3.5 h-3.5 rounded shrink-0 border-2 transition-colors ${
					isActive ? "border-transparent" : "border-gray-300"
				}`}
				style={
					isActive
						? {
								backgroundColor: layer.style.strokeColor,
								opacity: showDisabled ? 0.4 : 1,
						  }
						: undefined
				}
			/>
			<span
				className={`text-xs flex-1 truncate ${
					isActive ? "text-gray-900 font-medium" : "text-gray-600"
				} ${showDisabled ? "opacity-50" : ""}`}
			>
				{layer.label}
			</span>
			{isActive &&
				(showDisabled ? (
					<EyeOff className="w-3 h-3 text-gray-300 shrink-0" />
				) : (
					<Eye className="w-3 h-3 text-gray-400 shrink-0" />
				))}
		</button>
	);
}

export default memo(function MapLayerControl({
	activeLayers,
	onToggle,
	zoomTooLow,
	maxLayersReached,
	isExpanded,
	onToggleExpanded,
}: MapLayerControlProps) {
	const activeCount = activeLayers.size;
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;
		L.DomEvent.disableClickPropagation(containerRef.current);
		L.DomEvent.disableScrollPropagation(containerRef.current);
	}, []);

	return (
		<div ref={containerRef}>
			{!isExpanded ? (
				<button
					type="button"
					onClick={onToggleExpanded}
					className="relative flex items-center justify-center w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
					title="Camadas"
				>
					<Layers className="w-4 h-4 text-gray-600" />
					{activeCount > 0 && (
						<span className="absolute -top-1 -right-1 w-4 h-4 bg-[#15803d] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
							{activeCount}
						</span>
					)}
				</button>
			) : (
				<div className="bg-white rounded-lg shadow-lg border border-gray-200 w-60 overflow-hidden">
					<div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-200">
						<div className="flex items-center gap-2">
							<Layers className="w-3.5 h-3.5 text-gray-500" />
							<span className="text-xs font-semibold text-gray-700">Camadas</span>
							{activeCount > 0 && (
								<span className="text-[10px] text-gray-400">({activeCount})</span>
							)}
						</div>
						<button
							type="button"
							onClick={onToggleExpanded}
							className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					</div>

					<div className="max-h-80 overflow-y-auto">
						{LAYER_GROUPS.map((group) => {
							const groupLayers = MAP_LAYERS.filter((l) => l.group === group.id);
							if (groupLayers.length === 0) return null;

							return (
								<div key={group.id}>
									<div className="px-3 py-1.5 bg-gray-50/50 border-b border-gray-100">
										<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
											{group.label}
										</p>
										<p className="text-[9px] text-gray-300">{group.description}</p>
									</div>
									<div className="divide-y divide-gray-50">
										{groupLayers.map((layer) => (
											<LayerItem
												key={layer.id}
												layer={layer}
												isActive={activeLayers.has(layer.id)}
												onToggle={() => onToggle(layer.id)}
												zoomTooLow={zoomTooLow}
											/>
										))}
									</div>
								</div>
							);
						})}
					</div>

					{zoomTooLow && activeCount > 0 && (
						<div className="px-3 py-2 bg-amber-50 border-t border-amber-100">
							<p className="text-[10px] text-amber-700">
								Zoom 8+ necessário para visualizar
							</p>
						</div>
					)}

					{maxLayersReached && (
						<div className="px-3 py-2 bg-orange-50 border-t border-orange-100">
							<p className="text-[10px] text-orange-700">
								Limite de 5 camadas ativas atingido
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
});
