import { PlaneTakeoff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";
import type { AirspaceFeature } from "../FlightRestrictionLayer/FlightRestrictionLayer";

interface AirspaceInfoPanelProps {
	feature: AirspaceFeature;
	onClose: () => void;
}

const LAYER_LABELS: Record<string, string> = {
	fir: "FIR — Região de Informação de Voo",
	ctr: "CTR — Zona de Controle",
	tma: "TMA — Área de Controle Terminal",
	atz: "ATZ — Zona de Tráfego de Aeródromo",
	area_proibida: "Área Proibida",
	area_restrita: "Área Restrita",
	area_perigosa: "Área Perigosa",
	airport: "Aeródromo",
	heliport: "Heliponto",
};

const LAYER_COLORS: Record<string, string> = {
	fir: "#1976d2",
	ctr: "#e63946",
	tma: "#f4a261",
	atz: "#f8c100",
	area_proibida: "#cc0000",
	area_restrita: "#e67e00",
	area_perigosa: "#ccb800",
	airport: "#1e40af",
	heliport: "#7b2d8e",
};

function FieldRow({ label, value }: { label: string; value: string | number | null }) {
	if (value === null || value === undefined || value === "") return null;
	return (
		<div className="flex items-start justify-between gap-3">
			<span className="text-xs text-gray-500 shrink-0">{label}</span>
			<span className="text-xs text-gray-900 font-medium text-right break-words">
				{String(value)}
			</span>
		</div>
	);
}

const PANEL_WIDTH = 300;

export default function AirspaceInfoPanel({ feature, onClose }: AirspaceInfoPanelProps) {
	const map = useMap();
	const panelRef = useRef<HTMLDivElement>(null);
	const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

	useEffect(() => {
		const update = () => {
			const pt = map.project([feature.latlng.lng, feature.latlng.lat]);
			const container = map.getContainer();
			const mapWidth = container.clientWidth;
			const panelHeight = panelRef.current?.offsetHeight ?? 200;
			const margin = 10;

			let left = pt.x - PANEL_WIDTH / 2;
			let top = pt.y - panelHeight - 16;

			if (left < margin) left = margin;
			if (left + PANEL_WIDTH > mapWidth - margin) left = mapWidth - PANEL_WIDTH - margin;
			if (top < margin) top = pt.y + 16;

			setStyle({ left, top, opacity: 1 });
		};
		update();
		map.on("move", update);
		map.on("zoom", update);
		return () => {
			map.off("move", update);
			map.off("zoom", update);
		};
	}, [map, feature.latlng]);

	const props = feature.properties;
	const layerKey = String(props._decea_layer ?? "");
	const layerLabel = LAYER_LABELS[layerKey] ?? layerKey;
	const layerColor = LAYER_COLORS[layerKey] ?? "#555555";
	const isAirport = layerKey === "airport" || layerKey === "heliport";

	const title = isAirport
		? String(props.nam ?? props.localidade_id ?? "Aeródromo")
		: String(props.nam ?? props.ident ?? layerLabel);

	return (
		<div
			ref={panelRef}
			style={{ ...style, width: PANEL_WIDTH, transition: "opacity 0.15s ease" }}
			className="absolute z-[1001] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-start justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-200">
				<div className="flex items-start gap-2 min-w-0">
					<PlaneTakeoff
						className="w-4 h-4 shrink-0 mt-0.5"
						style={{ color: layerColor }}
					/>
					<div className="min-w-0">
						<h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
							{title}
						</h3>
						<p className="text-[10px] mt-0.5 font-medium" style={{ color: layerColor }}>
							{layerLabel}
						</p>
					</div>
				</div>
				<button
					onClick={onClose}
					className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors shrink-0 -mt-0.5"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			{/* Fields */}
			<div className="px-3 py-2.5 space-y-1.5">
				{isAirport ? (
					<>
						<FieldRow label="Código ICAO" value={props.localidade_id} />
						<FieldRow label="Nome" value={props.nam} />
						<FieldRow label="Município" value={props.municipio} />
						<FieldRow label="UF" value={props.uf} />
						<FieldRow label="Tipo" value={props.tipo} />
						<FieldRow
							label="Uso"
							value={
								props.uso === "PRIV"
									? "Privado"
									: props.uso === "PUB"
									? "Público"
									: props.uso
							}
						/>
						<FieldRow
							label="Elevação"
							value={props.elevacao != null ? `${props.elevacao} ft` : null}
						/>
						<FieldRow label="FIR" value={props.fir} />
					</>
				) : (
					<>
						<FieldRow label="Identificação" value={props.ident} />
						<FieldRow label="Nome" value={props.nam} />
						<FieldRow label="Tipo" value={props.typ} />
						<FieldRow
							label="Limite Superior"
							value={props.upperlimit != null ? `FL ${props.upperlimit}` : null}
						/>
						<FieldRow
							label="Limite Inferior"
							value={
								props.lowerlimi1 != null
									? props.lowerlimi1 === 0
										? "SFC (Superfície)"
										: `FL ${props.lowerlimi1}`
									: null
							}
						/>
					</>
				)}
			</div>

			{/* Coordinates */}
			<div className="px-3 py-2 border-t border-gray-100 flex items-center gap-4">
				<div className="flex items-center gap-1.5">
					<span className="text-[10px] text-gray-400">Lat</span>
					<span className="text-xs font-mono text-gray-700">
						{feature.latlng.lat.toFixed(6)}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<span className="text-[10px] text-gray-400">Lng</span>
					<span className="text-xs font-mono text-gray-700">
						{feature.latlng.lng.toFixed(6)}
					</span>
				</div>
			</div>

			<div className="px-3 py-1.5 bg-blue-50 border-t border-blue-100">
				<p className="text-[10px] text-blue-600">Fonte: DECEA GeoAISWEB • CC BY 4.0</p>
			</div>
		</div>
	);
}
