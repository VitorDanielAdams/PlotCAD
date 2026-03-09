import maplibregl from "maplibre-gl";
import { AlertCircle, Loader2 } from "lucide-react";
import { Protocol } from "pmtiles";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapProvider, useMap } from "../../contexts/MapContext";
import { MAP_LAYERS } from "../../config/mapLayers";
import type { MapLayerConfig, SelectedFeature } from "../../types/map.types";
import LocationSearch from "./components/LocationSearch/LocationSearch";
import MapLayerControl from "./components/MapLayerControl/MapLayerControl";
import { useMapLayerControl } from "./components/MapLayerControl/MapLayerControl.hooks";
import MapModeControls, { type MapMode } from "./components/MapModeControls/MapModeControls";
import PmTilesLayer from "./components/PmTilesLayer/PmTilesLayer";
import PropertyInfoPanel from "./components/PropertyInfoPanel/PropertyInfoPanel";
import FlightRestrictionLayer, {
	type AirspaceFeature,
} from "./components/FlightRestrictionLayer/FlightRestrictionLayer";
import NtripStationsLayer, {
	type NtripFeature,
} from "./components/NtripStationsLayer/NtripStationsLayer";
import AirspaceInfoPanel from "./components/AirspaceInfoPanel/AirspaceInfoPanel";
import NtripInfoPanel from "./components/NtripInfoPanel/NtripInfoPanel";

const TILE_SATELLITE =
	"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TILE_LABELS =
	"https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

function MapContent() {
	const map = useMap();
	const {
		meetsMinZoom,
		activeLayers,
		layerOrder,
		toggleLayer,
		moveLayer,
		maxLayersReached,
	} = useMapLayerControl();

	// Map mode: mutually exclusive
	const [activeMode, setActiveMode] = useState<MapMode>("layers");
	const [isLayerPanelExpanded, setIsLayerPanelExpanded] = useState(false);

	// CAR/SIGEF/SNCI selection
	const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);

	// Flight restriction selection
	const [selectedAirspace, setSelectedAirspace] = useState<AirspaceFeature | null>(null);
	const [flightLoading, setFlightLoading] = useState(false);
	const [flightError, setFlightError] = useState<string | null>(null);

	// NTRIP selection
	const [selectedNtrip, setSelectedNtrip] = useState<NtripFeature | null>(null);
	const [ntripLoading, setNtripLoading] = useState(false);
	const [ntripError, setNtripError] = useState<string | null>(null);

	const layerOrderRef = useRef(layerOrder);
	layerOrderRef.current = layerOrder;
	const meetsMinZoomRef = useRef(meetsMinZoom);
	meetsMinZoomRef.current = meetsMinZoom;
	const activeModeRef = useRef(activeMode);
	activeModeRef.current = activeMode;

	const handleModeChange = useCallback((mode: MapMode) => {
		if (mode === activeModeRef.current) {
			// Same mode: toggle panel for layers, otherwise do nothing
			if (mode === "layers") setIsLayerPanelExpanded((p) => !p);
			return;
		}
		setActiveMode(mode);
		setSelectedFeature(null);
		setSelectedAirspace(null);
		setSelectedNtrip(null);
		setFlightError(null);
		setNtripError(null);
		if (mode === "layers") {
			setIsLayerPanelExpanded(true);
		} else {
			setIsLayerPanelExpanded(false);
		}
	}, []);

	// Sync MapLibre layer order when layerOrder changes
	useEffect(() => {
		if (!(map as any).style) return;
		for (let i = 0; i < layerOrder.length; i++) {
			const fillId = `${layerOrder[i]}-fill`;
			const strokeId = `${layerOrder[i]}-stroke`;
			if (map.getLayer(fillId)) {
				map.moveLayer(fillId);
				map.moveLayer(strokeId);
			}
		}
	}, [map, layerOrder]);

	// Centralized click handler for PMTiles layers (only active in layers mode)
	useEffect(() => {
		const handleClick = (e: maplibregl.MapMouseEvent) => {
			const mode = activeModeRef.current;
			if (mode !== "layers") return;

			const order = layerOrderRef.current;
			const zoomOk = meetsMinZoomRef.current;
			if (!zoomOk || order.length === 0) {
				setSelectedFeature(null);
				return;
			}

			for (let i = order.length - 1; i >= 0; i--) {
				const layerId = order[i];
				const config = MAP_LAYERS.find((l) => l.id === layerId);
				if (!config?.clickable) continue;

				const fillId = `${layerId}-fill`;
				if (!map.getLayer(fillId)) continue;

				const features = map.queryRenderedFeatures(e.point, { layers: [fillId] });
				if (features && features.length > 0) {
					const picked = features[0];
					const props: Record<string, string | number | null> = {};
					if (picked.properties) {
						for (const [k, v] of Object.entries(picked.properties)) {
							props[k] = v as string | number | null;
						}
					}
					setSelectedFeature({
						layerId,
						properties: props,
						latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng },
					});
					return;
				}
			}

			setSelectedFeature(null);
		};

		map.on("click", handleClick);
		return () => {
			map.off("click", handleClick);
		};
	}, [map]);

	const handleClosePanel = useCallback(() => {
		setSelectedFeature(null);
	}, []);

	const getLayerConfig = useCallback((layerId: string): MapLayerConfig | undefined => {
		return MAP_LAYERS.find((l) => l.id === layerId);
	}, []);

	const isLayersMode = activeMode === "layers";
	const isFlightMode = activeMode === "flight";
	const isNtripMode = activeMode === "ntrip";

	const specialLoading = (isFlightMode && flightLoading) || (isNtripMode && ntripLoading);
	const specialError = (isFlightMode ? flightError : null) ?? (isNtripMode ? ntripError : null);

	return (
		<>
			{/* PMTiles layers — hidden when in special modes */}
			{MAP_LAYERS.map((layer) => (
				<PmTilesLayer
					key={layer.id}
					config={layer}
					visible={isLayersMode && activeLayers.has(layer.id) && meetsMinZoom}
				/>
			))}

			{/* Special mode layers */}
			{isFlightMode && (
				<FlightRestrictionLayer
					onFeatureSelect={setSelectedAirspace}
					onLoadingChange={setFlightLoading}
					onError={setFlightError}
				/>
			)}
			{isNtripMode && (
				<NtripStationsLayer
					onFeatureSelect={setSelectedNtrip}
					onLoadingChange={setNtripLoading}
					onError={setNtripError}
				/>
			)}

			{/* Controls: top right */}
			<div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
				<LocationSearch />

				{/* Mode buttons row */}
				<MapModeControls
					activeMode={activeMode}
					onModeChange={handleModeChange}
					layersActiveCount={activeLayers.size}
				/>

				{/* Layers panel — shown only in layers mode when expanded */}
				{isLayersMode && (
					<MapLayerControl
						activeLayers={activeLayers}
						layerOrder={layerOrder}
						onToggle={toggleLayer}
						onMoveLayer={moveLayer}
						zoomTooLow={!meetsMinZoom}
						maxLayersReached={maxLayersReached}
						isExpanded={isLayerPanelExpanded}
						onToggleExpanded={() => setIsLayerPanelExpanded((p) => !p)}
					/>
				)}

				{/* Flight/NTRIP mode legend */}
				{isFlightMode && !flightLoading && !flightError && (
					<div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2 w-52">
						<p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
							Legenda
						</p>
						{[
							{ color: "#cc0000", label: "Área Proibida" },
							{ color: "#e67e00", label: "Área Restrita" },
							{ color: "#ccb800", label: "Área Perigosa" },
							{ color: "#e63946", label: "CTR — Zona de Controle" },
							{ color: "#f4a261", label: "TMA" },
							{ color: "#f8c100", label: "ATZ" },
							{ color: "#1976d2", label: "FIR" },
							{ color: "#1e40af", label: "Aeródromo" },
							{ color: "#7b2d8e", label: "Heliponto" },
						].map(({ color, label }) => (
							<div key={label} className="flex items-center gap-2 py-0.5">
								<span
									className="w-3 h-3 rounded-sm shrink-0 border"
									style={{ backgroundColor: color, borderColor: color, opacity: 0.8 }}
								/>
								<span className="text-[10px] text-gray-600">{label}</span>
							</div>
						))}
						<p className="text-[9px] text-gray-400 mt-1.5">Fonte: DECEA GeoAISWEB • CC BY 4.0</p>
					</div>
				)}

				{isNtripMode && !ntripLoading && !ntripError && (
					<div className="bg-white rounded-lg shadow-md border border-gray-200 px-3 py-2 w-52">
						<p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
							Estações NTRIP
						</p>
						<div className="flex items-center gap-2 py-0.5">
							<span className="w-3 h-3 rounded-full bg-sky-400 border-2 border-white shrink-0 shadow-sm" />
							<span className="text-[10px] text-gray-600">Estação Ativa</span>
						</div>
						<div className="flex items-center gap-2 py-0.5">
							<span className="w-3 h-3 rounded-full bg-sky-400 border-2 border-white shrink-0 shadow-sm opacity-40" />
							<span className="text-[10px] text-gray-600">Estação Inativa</span>
						</div>
						<p className="text-[9px] text-gray-400 mt-1.5">
							Caster: 170.84.40.52:2101
						</p>
						<p className="text-[9px] text-gray-400">Fonte: RBMC-IP / IBGE</p>
					</div>
				)}
			</div>

			{/* Loading overlay for special modes */}
			{specialLoading && (
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/90 rounded-xl shadow-lg px-5 py-4 flex items-center gap-3">
					<Loader2 className="w-5 h-5 text-[#15803d] animate-spin" />
					<span className="text-sm text-gray-700 font-medium">
						{isFlightMode ? "Carregando dados do DECEA..." : "Carregando estações RBMC..."}
					</span>
				</div>
			)}

			{/* Error toast for special modes */}
			{specialError && !specialLoading && (
				<div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg border border-amber-200 px-4 py-3 flex items-start gap-2.5 max-w-sm">
					<AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
					<p className="text-xs text-gray-700">{specialError}</p>
				</div>
			)}

			{/* Info panels */}
			{selectedFeature && isLayersMode && (
				<PropertyInfoPanel
					feature={selectedFeature}
					layerConfig={getLayerConfig(selectedFeature.layerId)}
					onClose={handleClosePanel}
				/>
			)}
			{selectedAirspace && isFlightMode && (
				<AirspaceInfoPanel
					feature={selectedAirspace}
					onClose={() => setSelectedAirspace(null)}
				/>
			)}
			{selectedNtrip && isNtripMode && (
				<NtripInfoPanel
					feature={selectedNtrip}
					onClose={() => setSelectedNtrip(null)}
				/>
			)}
		</>
	);
}

// Register PMTiles protocol once
let protocolRegistered = false;

const HomePage = memo(() => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [map, setMap] = useState<maplibregl.Map | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		if (!protocolRegistered) {
			const protocol = new Protocol();
			maplibregl.addProtocol("pmtiles", protocol.tile);
			protocolRegistered = true;
		}

		const instance = new maplibregl.Map({
			container: containerRef.current,
			style: {
				version: 8,
				sources: {
					satellite: {
						type: "raster",
						tiles: [TILE_SATELLITE],
						tileSize: 256,
						maxzoom: 18,
						attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
					},
					labels: {
						type: "raster",
						tiles: [TILE_LABELS],
						tileSize: 256,
						maxzoom: 18,
						attribution: "Labels &copy; Esri",
					},
				},
				layers: [
					{
						id: "satellite-layer",
						type: "raster",
						source: "satellite",
						maxzoom: 20,
					},
					{
						id: "labels-layer",
						type: "raster",
						source: "labels",
						maxzoom: 20,
						paint: { "raster-opacity": 0.9 },
					},
				],
			},
			center: [-54.576612, -25.5543733],
			zoom: 13,
			attributionControl: false,
		});

		instance.addControl(
			new maplibregl.AttributionControl({ compact: false }),
			"bottom-right",
		);
		instance.addControl(new maplibregl.NavigationControl(), "bottom-right");

		instance.on("load", () => {
			setMap(instance);
		});

		return () => {
			instance.remove();
			setMap(null);
		};
	}, []);

	return (
		<div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
			<div ref={containerRef} className="w-full h-full" />
			{map && (
				<MapProvider map={map}>
					<MapContent />
				</MapProvider>
			)}
		</div>
	);
});

export default HomePage;
