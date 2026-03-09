import { Check, Copy, Download, Loader2, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";
import type {
	MapFeatureProperties,
	MapLayerConfig,
	SelectedFeature,
} from "../../../../types/map.types";
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

// ── Geometry fetchers per data source ──────────────────────────────

const GEOSERVER_CAR = "https://geoserver.car.gov.br/geoserver/sicar/ows";

async function fetchCarGeometry(id: string, props: MapFeatureProperties): Promise<string | null> {
	const uf = props.cod_estado ? String(props.cod_estado) : null;
	if (!uf) return null;
	const cacheKey = `car:${id}:${uf}`;
	return deduplicatedFetch(cacheKey, async () => {
		try {
			const params = new URLSearchParams({
				service: "WFS",
				version: "2.0.0",
				request: "GetFeature",
				typeName: `sicar:sicar_imoveis_${uf.toLowerCase()}`,
				outputFormat: "application/json",
				CQL_FILTER: `cod_imovel='${id}'`,
				propertyName: "geo_area_imovel",
				count: "1",
			});
			const res = await fetch(`${GEOSERVER_CAR}?${params}`, {
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

// SIGEF/SNCI geometry endpoints require gov.br auth — fallback to point KML
async function fetchSigefGeometry(_id: string, _props: MapFeatureProperties): Promise<string | null> {
	return null;
}

async function fetchSnciGeometry(_id: string, _props: MapFeatureProperties): Promise<string | null> {
	return null;
}

const GEOMETRY_FETCHERS: Record<
	string,
	(id: string, props: MapFeatureProperties) => Promise<string | null>
> = {
	car: fetchCarGeometry,
	sigef: fetchSigefGeometry,
	snci: fetchSnciGeometry,
};

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
		const updatePosition = () => {
			const pt = map.project([feature.latlng.lng, feature.latlng.lat]);
			const container = map.getContainer();
			const mapWidth = container.clientWidth;
			const panelHeight = panelRef.current?.offsetHeight ?? 280;
			const margin = 10;

			let left = pt.x - PANEL_WIDTH / 2;
			let top = pt.y - panelHeight - 16;

			if (left < margin) left = margin;
			if (left + PANEL_WIDTH > mapWidth - margin)
				left = mapWidth - PANEL_WIDTH - margin;
			if (top < margin) top = pt.y + 16;

			setStyle({ left, top, opacity: 1 });
		};

		updatePosition();
		map.on("move", updatePosition);
		map.on("zoom", updatePosition);
		map.on("moveend", updatePosition);
		return () => {
			map.off("move", updatePosition);
			map.off("zoom", updatePosition);
			map.off("moveend", updatePosition);
		};
	}, [map, feature.latlng]);

	const props = feature.properties;
	const fields = layerConfig?.fields ?? [];
	const kmlCfg = layerConfig?.kmlConfig;

	// Dynamic identifier based on kmlConfig
	const identifierValue = kmlCfg ? (props[kmlCfg.identifierKey] ? String(props[kmlCfg.identifierKey]) : null) : null;
	const identifierLabel = kmlCfg?.identifierLabel ?? "Código";

	// Location info (CAR-specific but harmless for others — just won't render if missing)
	const municipality = props.municipio ? String(props.municipio) : null;
	const uf = props.cod_estado ? String(props.cod_estado) : null;
	const locationText = [municipality, uf].filter(Boolean).join("/");

	// Title
	const tipoCode = props.ind_tipo ? String(props.ind_tipo) : null;
	const propertyType = tipoCode ? PROPERTY_TYPE_MAP[tipoCode] ?? tipoCode : null;
	const panelTitle = propertyType || layerConfig?.label || "Informações";

	// KML support — enabled when layer has kmlConfig and identifier exists
	const hasKmlSupport = Boolean(kmlCfg && identifierValue);

	// Keys to exclude from the data fields list (shown in header/ID section)
	const headerKeys = new Set<string>();
	if (kmlCfg) headerKeys.add(kmlCfg.identifierKey);
	headerKeys.add("municipio");
	headerKeys.add("cod_estado");
	headerKeys.add("ind_tipo");

	const handleDownloadKml = useCallback(async () => {
		const id = identifierValue ?? "";
		const name = id || panelTitle;

		const descParts: string[] = [];
		if (id) descParts.push(`${identifierLabel}: ${id}`);
		if (municipality) descParts.push(`Município: ${municipality}`);
		if (uf) descParts.push(`UF: ${uf}`);
		const desc = descParts.join("\n");

		let kml: string | null = null;

		if (id && kmlCfg?.geometryFetcher) {
			const fetcher = GEOMETRY_FETCHERS[kmlCfg.geometryFetcher];
			if (fetcher) {
				setDownloading(true);
				const geoJson = await fetcher(id, props);
				setDownloading(false);
				if (geoJson) {
					kml = buildGeoJsonPolygonKml(name, geoJson, desc);
				}
			}
		}

		if (!kml) {
			kml = buildPointKml(name, feature.latlng.lat, feature.latlng.lng, desc);
		}

		const filename = id ? id.replace(/[^a-z0-9_\-]/gi, "_") : "imovel";
		downloadKml(filename, kml);
	}, [feature, identifierValue, identifierLabel, municipality, uf, panelTitle, kmlCfg, props]);

	const dataFields = fields.filter((f) => !headerKeys.has(f.key));

	return (
		<div
			ref={panelRef}
			style={{ ...style, width: PANEL_WIDTH, maxWidth: "calc(100vw - 20px)", transition: "opacity 0.15s ease" }}
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

			{/* ID section — dynamic per layer */}
			{identifierValue && (
				<div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
					<div className="flex items-center justify-between mb-0.5">
						<span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
							{identifierLabel}
						</span>
						<CopyButton text={identifierValue} />
					</div>
					<p className="text-xs font-mono text-gray-800 break-all leading-relaxed">
						{identifierValue}
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

			{/* KML Download */}
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
