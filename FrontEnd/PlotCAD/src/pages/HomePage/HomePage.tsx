import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MapProvider, useMap } from "../../contexts/MapContext";
import { MAP_LAYERS } from "../../config/mapLayers";
import type { MapLayerConfig, SelectedFeature } from "../../types/map.types";
import LocationSearch from "./components/LocationSearch/LocationSearch";
import MapLayerControl from "./components/MapLayerControl/MapLayerControl";
import { useMapLayerControl } from "./components/MapLayerControl/MapLayerControl.hooks";
import PmTilesLayer from "./components/PmTilesLayer/PmTilesLayer";
import PropertyInfoPanel from "./components/PropertyInfoPanel/PropertyInfoPanel";

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
		isExpanded,
		toggleExpanded,
		maxLayersReached,
	} = useMapLayerControl();
	const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);
	const layerOrderRef = useRef(layerOrder);
	layerOrderRef.current = layerOrder;
	const meetsMinZoomRef = useRef(meetsMinZoom);
	meetsMinZoomRef.current = meetsMinZoom;

	// Sync MapLibre layer order when layerOrder changes
	useEffect(() => {
		for (let i = 0; i < layerOrder.length; i++) {
			const fillId = `${layerOrder[i]}-fill`;
			const strokeId = `${layerOrder[i]}-stroke`;
			if (map.getLayer(fillId)) {
				map.moveLayer(fillId);
				map.moveLayer(strokeId);
			}
		}
	}, [map, layerOrder]);

	// Centralized click handler — respects layer priority (last in order = top = first queried)
	useEffect(() => {
		const handleClick = (e: maplibregl.MapMouseEvent) => {
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

	return (
		<>
			{MAP_LAYERS.map((layer) => (
				<PmTilesLayer
					key={layer.id}
					config={layer}
					visible={activeLayers.has(layer.id) && meetsMinZoom}
				/>
			))}

			<div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
				<LocationSearch />
				<MapLayerControl
					activeLayers={activeLayers}
					layerOrder={layerOrder}
					onToggle={toggleLayer}
					onMoveLayer={moveLayer}
					zoomTooLow={!meetsMinZoom}
					maxLayersReached={maxLayersReached}
					isExpanded={isExpanded}
					onToggleExpanded={toggleExpanded}
				/>
			</div>

			{selectedFeature && (
				<PropertyInfoPanel
					feature={selectedFeature}
					layerConfig={getLayerConfig(selectedFeature.layerId)}
					onClose={handleClosePanel}
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
