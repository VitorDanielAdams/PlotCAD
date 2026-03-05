import L from "leaflet";
import { Check, Copy, Download, Loader2, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import type { MapLayerConfig, SelectedFeature } from "../../../../types/map.types";
import { deduplicatedFetch } from "../../../../utils/geometryCache";
import {
	buildGeoJsonPolygonKml,
	buildPointKml,
	downloadKml,
} from "../../../../utils/kml";

interface PropertyInfoPanelProps {
	feature: SelectedFeature;
	layerConfig: MapLayerConfig | undefined;
	onClose: () => void;
}

const CONDITION_MAP: Record<string, { label: string; color: string }> = {
	"Cadastro com pendência de análise": {
		label: "Pendência de análise",
		color: "text-yellow-700 bg-yellow-50 border-yellow-200",
	},
	"Aguardando regularização ambiental": {
		label: "Aguardando regularização",
		color: "text-orange-600 bg-orange-50 border-orange-200",
	},
	"Cadastro analisado com pendência": {
		label: "Analisado com pendência",
		color: "text-red-600 bg-red-50 border-red-200",
	},
	"Cadastro analisado sem pendência": {
		label: "Sem pendência",
		color: "text-green-600 bg-green-50 border-green-200",
	},
};

const PROPERTY_TYPE_MAP: Record<string, string> = {
	IRU: "Imóvel Rural",
	AST: "Assentamento",
	PCT: "Povos e Comunidades Tradicionais",
};

function formatArea(value: number | null): string {
	if (value === null || value === undefined) return "-";
	return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 4 })} ha`;
}

function formatDate(value: string | null): string {
	if (!value) return "-";
	const d = new Date(value);
	return isNaN(d.getTime()) ? value : d.toLocaleDateString("pt-BR");
}

function CopyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
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

function FieldRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-xs text-gray-500 shrink-0">{label}</span>
			<span className="text-xs text-gray-900 font-medium text-right break-words">
				{value || "-"}
			</span>
		</div>
	);
}

function ConditionBadge({ value }: { value: string }) {
	const info = CONDITION_MAP[value];
	if (!info)
		return <span className="text-xs text-gray-900 font-medium text-right">{value}</span>;
	return (
		<span
			className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${info.color}`}
		>
			{info.label}
		</span>
	);
}

const PANEL_WIDTH = 320;

const GEOSERVER_BASE = "https://geoserver.car.gov.br/geoserver/sicar/ows";

async function fetchCarGeometry(codImovel: string, uf: string): Promise<string | null> {
	const cacheKey = `${codImovel}:${uf}`;
	return deduplicatedFetch(cacheKey, async () => {
		try {
			const ufLower = uf.toLowerCase();
			const params = new URLSearchParams({
				service: "WFS",
				version: "2.0.0",
				request: "GetFeature",
				typeName: `sicar:sicar_imoveis_${ufLower}`,
				outputFormat: "application/json",
				CQL_FILTER: `cod_imovel='${codImovel}'`,
				propertyName: "geo_area_imovel",
				count: "1",
			});
			const res = await fetch(`${GEOSERVER_BASE}?${params}`, {
				signal: AbortSignal.timeout(10000),
			});
			if (!res.ok) return null;
			const data = await res.json();
			const geom = data?.features?.[0]?.geometry;
			if (!geom) return null;
			return JSON.stringify(geom);
		} catch {
			return null;
		}
	});
}

// Keys used in header or special ID section — excluded from data fields loop
const HEADER_KEYS = new Set(["cod_imovel", "municipio", "cod_estado", "ind_tipo"]);

export default function PropertyInfoPanel({
	feature,
	layerConfig,
	onClose,
}: PropertyInfoPanelProps) {
	const map = useMap();
	const panelRef = useRef<HTMLDivElement>(null);
	const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });
	const [downloading, setDownloading] = useState(false);

	useEffect(() => {
		if (!panelRef.current) return;
		L.DomEvent.disableClickPropagation(panelRef.current);
		L.DomEvent.disableScrollPropagation(panelRef.current);
	}, []);

	useEffect(() => {
		const updatePosition = () => {
			const pt = map.latLngToContainerPoint([feature.latlng.lat, feature.latlng.lng]);
			const mapSize = map.getSize();
			const panelHeight = panelRef.current?.offsetHeight ?? 280;
			const margin = 10;

			let left = pt.x - PANEL_WIDTH / 2;
			let top = pt.y - panelHeight - 16;

			if (left < margin) left = margin;
			if (left + PANEL_WIDTH > mapSize.x - margin)
				left = mapSize.x - PANEL_WIDTH - margin;
			if (top < margin) top = pt.y + 16;

			setStyle({ left, top, opacity: 1 });
		};

		updatePosition();
		map.on("move zoom moveend", updatePosition);
		return () => {
			map.off("move zoom moveend", updatePosition);
		};
	}, [map, feature.latlng]);

	const props = feature.properties;
	const fields = layerConfig?.fields ?? [];

	const codImovel = props.cod_imovel ? String(props.cod_imovel) : null;
	const uf = props.cod_estado ? String(props.cod_estado) : null;
	const municipality = props.municipio ? String(props.municipio) : null;
	const locationText = [municipality, uf].filter(Boolean).join("/");

	const tipoCode = props.ind_tipo ? String(props.ind_tipo) : null;
	const propertyType = tipoCode ? PROPERTY_TYPE_MAP[tipoCode] ?? tipoCode : null;
	const panelTitle = propertyType || layerConfig?.label || "Informações";

	const hasKmlSupport = fields.some((f) => f.key === "cod_imovel") && Boolean(codImovel);

	const handleDownloadKml = useCallback(async () => {
		const code = codImovel ?? "";
		const name = code || panelTitle;

		const descParts: string[] = [];
		if (code) descParts.push(`Código CAR: ${code}`);
		if (municipality) descParts.push(`Município: ${municipality}`);
		if (uf) descParts.push(`UF: ${uf}`);
		const desc = descParts.join("\n");

		let kml: string | null = null;

		if (code && uf) {
			setDownloading(true);
			const geoJson = await fetchCarGeometry(code, uf);
			setDownloading(false);
			if (geoJson) {
				kml = buildGeoJsonPolygonKml(name, geoJson, desc);
			}
		}

		if (!kml) {
			kml = buildPointKml(name, feature.latlng.lat, feature.latlng.lng, desc);
		}

		const filename = code ? code.replace(/[^a-z0-9_\-]/gi, "_") : "imovel_rural";
		downloadKml(filename, kml);
	}, [feature, codImovel, municipality, uf, panelTitle]);

	const dataFields = fields.filter((f) => !HEADER_KEYS.has(f.key));

	return (
		<div
			ref={panelRef}
			style={{ ...style, width: PANEL_WIDTH, transition: "opacity 0.15s ease" }}
			className="absolute z-[1001] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-start justify-between px-3 py-2.5 bg-gray-50 border-b border-gray-200">
				<div className="flex items-start gap-2 min-w-0">
					<MapPin className="w-4 h-4 text-[#15803d] shrink-0 mt-0.5" />
					<div className="min-w-0">
						<h3 className="text-sm font-semibold text-gray-900 leading-tight">
							{panelTitle}
						</h3>
						{locationText && (
							<p className="text-xs text-gray-500 mt-0.5">{locationText}</p>
						)}
					</div>
				</div>
				<button
					onClick={onClose}
					className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors shrink-0 -mt-0.5"
				>
					<X className="w-4 h-4" />
				</button>
			</div>

			{/* ID section */}
			{codImovel && (
				<div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
					<div className="flex items-center justify-between mb-0.5">
						<span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
							Código CAR
						</span>
						<CopyButton text={codImovel} />
					</div>
					<p className="text-xs font-mono text-gray-800 break-all leading-relaxed">
						{codImovel}
					</p>
				</div>
			)}

			{/* Data fields */}
			{dataFields.length > 0 && (
				<div className="px-3 py-2.5">
					<div className="space-y-1.5">
						{dataFields.map((field) => {
							const raw = props[field.key];
							if (raw === null || raw === undefined) return null;
							const value = String(raw);

							if (field.format === "condition") {
								return (
									<div
										key={field.key}
										className="flex items-center justify-between gap-3"
									>
										<span className="text-xs text-gray-500 shrink-0">{field.label}</span>
										<ConditionBadge value={value} />
									</div>
								);
							}

							if (field.format === "area") {
								return (
									<FieldRow
										key={field.key}
										label={field.label}
										value={formatArea(Number(raw))}
									/>
								);
							}

							if (field.format === "date") {
								return (
									<FieldRow
										key={field.key}
										label={field.label}
										value={formatDate(value)}
									/>
								);
							}

							if (field.format === "propertyType") {
								return (
									<FieldRow
										key={field.key}
										label={field.label}
										value={PROPERTY_TYPE_MAP[value] ?? value}
									/>
								);
							}

							return <FieldRow key={field.key} label={field.label} value={value} />;
						})}
					</div>
				</div>
			)}

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

			{/* KML Download — only for layers with CAR geometry support */}
			{hasKmlSupport && (
				<div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
					<button
						onClick={handleDownloadKml}
						disabled={downloading}
						className="flex items-center justify-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-[#15803d] bg-white border border-gray-200 rounded-md hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{downloading ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<Download className="w-3.5 h-3.5" />
						)}
						{downloading ? "Baixando..." : "Baixar KML"}
					</button>
				</div>
			)}
		</div>
	);
}
