import { Check, Copy, Radio, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";
import type { NtripFeature } from "../NtripStationsLayer/NtripStationsLayer";

interface NtripInfoPanelProps {
	feature: NtripFeature;
	onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);
	useEffect(() => {
		if (!copied) return;
		const t = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(t);
	}, [copied]);
	return (
		<button
			onClick={() => {
				navigator.clipboard.writeText(text);
				setCopied(true);
			}}
			className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
			title="Copiar"
		>
			{copied ? (
				<Check className="w-3 h-3 text-green-500" />
			) : (
				<Copy className="w-3 h-3" />
			)}
		</button>
	);
}

function FieldRow({ label, value }: { label: string; value: string | null }) {
	if (!value) return null;
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-xs text-gray-500 shrink-0">{label}</span>
			<span className="text-xs text-gray-900 font-medium text-right">{value}</span>
		</div>
	);
}

const PANEL_WIDTH = 290;

export default function NtripInfoPanel({ feature, onClose }: NtripInfoPanelProps) {
	const map = useMap();
	const panelRef = useRef<HTMLDivElement>(null);
	const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
	const { properties: p } = feature;

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

	const isActive = !p.status || p.status.toUpperCase() === "ATIVA" || p.status === "";

	// NTRIP connection string for copy
	const ntripString = `Host: 170.84.40.52\nPort: 2101\nMountpoint: ${p.id}`;

	return (
		<div
			ref={panelRef}
			style={{ ...style, width: PANEL_WIDTH, transition: "opacity 0.15s ease" }}
			className="absolute z-[1001] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-start justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-200">
				<div className="flex items-start gap-2 min-w-0">
					<Radio className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
					<div className="min-w-0">
						<h3 className="text-sm font-semibold text-gray-900 leading-tight">{p.id}</h3>
						<p className="text-[10px] text-gray-500 mt-0.5 truncate">
							{p.nome || "Estação RBMC"}
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

			{/* Status badge */}
			<div className="px-3 pt-2.5 pb-1">
				<span
					className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
						isActive
							? "text-green-700 bg-green-50 border-green-200"
							: "text-red-600 bg-red-50 border-red-200"
					}`}
				>
					{isActive ? "Ativa" : "Inativa"}
				</span>
			</div>

			{/* Fields */}
			<div className="px-3 py-2 space-y-1.5">
				<FieldRow label="Município" value={p.municipio || null} />
				<FieldRow label="UF" value={p.uf || null} />
				<FieldRow
					label="Lat / Lng"
					value={`${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`}
				/>
				<FieldRow
					label="Altitude"
					value={p.altitude != null ? `${p.altitude.toFixed(3)} m` : null}
				/>
			</div>

			{/* Mountpoint section */}
			{p.id && (
				<div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
					<div className="flex items-center justify-between mb-1">
						<span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
							Conexão NTRIP
						</span>
						<CopyButton text={ntripString} />
					</div>
					<p className="text-[10px] font-mono text-gray-600 leading-relaxed whitespace-pre">
						{`170.84.40.52:2101\nMountpoint: ${p.id}`}
					</p>
				</div>
			)}

			<div className="px-3 py-1.5 bg-sky-50 border-t border-sky-100">
				<p className="text-[10px] text-sky-600">
					Fonte: RBMC-IP / IBGE • Rede Nacional de Monitoramento Contínuo
				</p>
			</div>
		</div>
	);
}
