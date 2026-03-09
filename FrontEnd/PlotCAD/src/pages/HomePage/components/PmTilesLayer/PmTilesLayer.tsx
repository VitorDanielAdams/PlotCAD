import { memo, useEffect, useRef } from "react";
import { useMap } from "../../../../contexts/MapContext";
import type { MapLayerConfig } from "../../../../types/map.types";

interface PmTilesLayerProps {
	config: MapLayerConfig;
	visible: boolean;
}

export default memo(function PmTilesLayer({ config, visible }: PmTilesLayerProps) {
	const map = useMap();
	const addedRef = useRef(false);

	const sourceId = config.id;
	const fillLayerId = `${config.id}-fill`;
	const strokeLayerId = `${config.id}-stroke`;

	// Add source + layers once
	useEffect(() => {
		if (addedRef.current) return;
		if (!(map as any).style) return;

		const pmtilesUrl = config.url.startsWith("pmtiles://")
			? config.url
			: `pmtiles://${config.url}`;

		map.addSource(sourceId, {
			type: "vector",
			url: pmtilesUrl,
			minzoom: config.minZoom,
			maxzoom: config.maxZoom,
		});

		map.addLayer({
			id: fillLayerId,
			type: "fill",
			source: sourceId,
			"source-layer": config.sourceLayer,
			paint: {
				"fill-color": config.style.fillColor,
				"fill-opacity": config.style.fillOpacity,
			},
			layout: { visibility: "none" },
			minzoom: config.minZoom,
			maxzoom: config.maxZoom + 4,
		});

		map.addLayer({
			id: strokeLayerId,
			type: "line",
			source: sourceId,
			"source-layer": config.sourceLayer,
			paint: {
				"line-color": config.style.strokeColor,
				"line-width": config.style.strokeWidth,
			},
			layout: { visibility: "none" },
			minzoom: config.minZoom,
			maxzoom: config.maxZoom + 4,
		});

		addedRef.current = true;

		return () => {
			addedRef.current = false;
			if (!(map as any).style) return;
			if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
			if (map.getLayer(strokeLayerId)) map.removeLayer(strokeLayerId);
			if (map.getSource(sourceId)) map.removeSource(sourceId);
		};
	}, [map, sourceId, fillLayerId, strokeLayerId, config]);

	// Toggle visibility
	useEffect(() => {
		if (!addedRef.current) return;
		if (!(map as any).style) return;
		const vis = visible ? "visible" : "none";
		if (map.getLayer(fillLayerId)) {
			map.setLayoutProperty(fillLayerId, "visibility", vis);
		}
		if (map.getLayer(strokeLayerId)) {
			map.setLayoutProperty(strokeLayerId, "visibility", vis);
		}
	}, [visible, map, fillLayerId, strokeLayerId]);

	return null;
});
