import type { LatLngTuple } from "leaflet";
import { memo, useMemo } from "react";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";

const TILE_SATELLITE =
	"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TILE_LABELS =
	"https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const tileOptions = {
	updateWhenIdle: true,
	updateWhenZooming: false,
	keepBuffer: 4,
	maxZoom: 19,
} as const;

const HomePage = memo(() => {
	const center = useMemo<LatLngTuple>(() => [-25.5543733, -54.576612], []);

	return (
		<MapContainer
			className="w-full"
			style={{ height: "calc(100vh - 64px)" }}
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
		</MapContainer>
	);
});

export default HomePage;
