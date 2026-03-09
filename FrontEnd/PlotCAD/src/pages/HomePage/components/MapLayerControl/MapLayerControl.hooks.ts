import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";

const MIN_ZOOM = 8;
const MAX_ACTIVE_LAYERS = 5;

export function useMapLayerControl() {
	const map = useMap();
	const zoomRef = useRef(map.getZoom());
	const [meetsMinZoom, setMeetsMinZoom] = useState(map.getZoom() >= MIN_ZOOM);
	const [layerOrder, setLayerOrder] = useState<string[]>([]);
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		const onZoom = () => {
			const z = map.getZoom();
			zoomRef.current = z;
			const meets = z >= MIN_ZOOM;
			setMeetsMinZoom((prev) => (prev === meets ? prev : meets));
		};
		map.on("zoom", onZoom);
		return () => {
			map.off("zoom", onZoom);
		};
	}, [map]);

	const toggleLayer = useCallback((layerId: string) => {
		setLayerOrder((prev) => {
			if (prev.includes(layerId)) {
				return prev.filter((id) => id !== layerId);
			}
			if (prev.length >= MAX_ACTIVE_LAYERS) return prev;
			return [...prev, layerId];
		});
	}, []);

	const moveLayer = useCallback(
		(layerId: string, direction: "up" | "down") => {
			setLayerOrder((prev) => {
				const idx = prev.indexOf(layerId);
				if (idx === -1) return prev;
				const target = direction === "up" ? idx + 1 : idx - 1;
				if (target < 0 || target >= prev.length) return prev;
				const next = [...prev];
				[next[idx], next[target]] = [next[target], next[idx]];
				return next;
			});
		},
		[],
	);

	const toggleExpanded = useCallback(() => {
		setIsExpanded((prev) => !prev);
	}, []);

	const activeLayers = useMemo(() => new Set(layerOrder), [layerOrder]);

	return {
		meetsMinZoom,
		activeLayers,
		layerOrder,
		toggleLayer,
		moveLayer,
		isExpanded,
		toggleExpanded,
		maxLayersReached: layerOrder.length >= MAX_ACTIVE_LAYERS,
	};
}
