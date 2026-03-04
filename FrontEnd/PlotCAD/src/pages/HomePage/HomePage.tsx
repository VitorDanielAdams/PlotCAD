import type { LatLngTuple } from "leaflet";
import { memo, useCallback, useMemo, useState } from "react";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";
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

const tileOptions = {
	updateWhenIdle: true,
	updateWhenZooming: false,
	keepBuffer: 2,
	maxZoom: 20,
	maxNativeZoom: 18,
	errorTileUrl:
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRkJggg==",
} as const;

function MapContent() {
	const {
		meetsMinZoom,
		activeLayers,
		toggleLayer,
		isExpanded,
		toggleExpanded,
		maxLayersReached,
	} = useMapLayerControl();
	const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);

	const handleFeatureClick = useCallback((feature: SelectedFeature) => {
		setSelectedFeature(feature);
	}, []);

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
					onFeatureClick={layer.clickable ? handleFeatureClick : undefined}
					onMapClickEmpty={layer.clickable ? handleClosePanel : undefined}
				/>
			))}

			<div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 items-end">
				<LocationSearch />
				<MapLayerControl
					activeLayers={activeLayers}
					onToggle={toggleLayer}
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

const HomePage = memo(() => {
	const center = useMemo<LatLngTuple>(() => [-25.5543733, -54.576612], []);

	return (
		<div className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
			<MapContainer
				className="w-full h-full"
				center={center}
				zoom={13}
				zoomSnap={0.5}
				zoomDelta={0.5}
				preferCanvas
				attributionControl={false}
			>
				<AttributionControl position="bottomright" prefix={false} />

				<TileLayer
					url={TILE_SATELLITE}
					attribution="Tiles &copy; Esri, Maxar, Earthstar Geographics"
					{...tileOptions}
				/>
				<TileLayer
					url={TILE_LABELS}
					attribution="Labels &copy; Esri"
					{...tileOptions}
					opacity={0.9}
				/>

				<MapContent />
			</MapContainer>
		</div>
	);
});

export default HomePage;
