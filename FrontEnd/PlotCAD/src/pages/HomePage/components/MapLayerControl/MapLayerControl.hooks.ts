import { useCallback, useRef, useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";

const CAR_MIN_ZOOM = 8;
const MAX_ACTIVE_LAYERS = 5;

export function useMapLayerControl() {
	const map = useMap();
	const zoomRef = useRef(map.getZoom());
	const [meetsMinZoom, setMeetsMinZoom] = useState(map.getZoom() >= CAR_MIN_ZOOM);
	const [activeLayers, setActiveLayers] = useState<Set<string>>(
		new Set(["car_area_imovel"]),
	);
	const [isExpanded, setIsExpanded] = useState(false);

	// Only trigger re-render when crossing the zoom threshold
	useMapEvent("zoom", () => {
		const z = map.getZoom();
		zoomRef.current = z;
		const meets = z >= CAR_MIN_ZOOM;
		setMeetsMinZoom((prev) => (prev === meets ? prev : meets));
	});

	const toggleLayer = useCallback((layerId: string) => {
		setActiveLayers((prev) => {
			const next = new Set(prev);
			if (next.has(layerId)) {
				next.delete(layerId);
			} else {
				if (next.size >= MAX_ACTIVE_LAYERS) return prev;
				next.add(layerId);
			}
			return next;
		});
	}, []);

	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => !prev);
	}, []);

	return {
		meetsMinZoom,
		activeLayers,
		toggleLayer,
		isExpanded,
		toggleExpanded,
		maxLayersReached: activeLayers.size >= MAX_ACTIVE_LAYERS,
	};
}
