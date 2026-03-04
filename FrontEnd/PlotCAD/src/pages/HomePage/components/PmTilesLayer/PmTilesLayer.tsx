import type L from "leaflet";
import { leafletLayer, PolygonSymbolizer } from "protomaps-leaflet";
import { memo, useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import type { MapLayerConfig, SelectedFeature } from "../../../../types/map.types";

interface PmTilesLayerProps {
	config: MapLayerConfig;
	visible: boolean;
	onFeatureClick?: (feature: SelectedFeature) => void;
	onMapClickEmpty?: () => void;
}

export default memo(function PmTilesLayer({
	config,
	visible,
	onFeatureClick,
	onMapClickEmpty,
}: PmTilesLayerProps) {
	const map = useMap();
	const layerRef = useRef<L.Layer | null>(null);
	const onFeatureClickRef = useRef(onFeatureClick);
	onFeatureClickRef.current = onFeatureClick;
	const onMapClickEmptyRef = useRef(onMapClickEmpty);
	onMapClickEmptyRef.current = onMapClickEmpty;

	// Create layer once on mount — preserves internal tile cache across visibility toggles
	useEffect(() => {
		const layer = leafletLayer({
			url: config.url,
			maxDataZoom: config.maxZoom,
			paintRules: [
				{
					dataLayer: config.sourceLayer,
					symbolizer: new PolygonSymbolizer({
						fill: config.style.fillColor,
						opacity: config.style.fillOpacity,
						stroke: config.style.strokeColor,
						width: config.style.strokeWidth,
					}),
				},
			],
		});

		layerRef.current = layer;

		return () => {
			if (layerRef.current) {
				map.removeLayer(layerRef.current);
				layerRef.current = null;
			}
		};
	}, [config.url, config.sourceLayer, config.style, config.maxZoom, map]);

	// Toggle visibility without destroying — avoids re-fetching PMTiles data
	useEffect(() => {
		if (!layerRef.current) return;

		if (visible) {
			if (!map.hasLayer(layerRef.current)) {
				layerRef.current.addTo(map);
			}
		} else {
			if (map.hasLayer(layerRef.current)) {
				map.removeLayer(layerRef.current);
			}
		}
	}, [visible, map]);

	const handleClick = useCallback(
		(e: L.LeafletMouseEvent) => {
			if (!layerRef.current || !config.clickable || !onFeatureClickRef.current) return;

			const layer = layerRef.current as any;
			if (typeof layer.queryTileFeaturesDebug !== "function") return;

			const bySource: Map<string, any[]> = layer.queryTileFeaturesDebug(
				e.latlng.lng,
				e.latlng.lat,
			);

			if (!bySource || bySource.size === 0) {
				onMapClickEmptyRef.current?.();
				return;
			}

			let picked: any = null;

			for (const features of bySource.values()) {
				const match = features.find((f: any) => f.layerName === config.sourceLayer);
				if (match) {
					picked = match;
					break;
				}
			}

			if (!picked) {
				for (const features of bySource.values()) {
					if (features.length > 0) {
						picked = features[0];
						break;
					}
				}
			}

			if (!picked) {
				onMapClickEmptyRef.current?.();
				return;
			}

			onFeatureClickRef.current({
				layerId: config.id,
				properties: picked.feature?.props ?? {},
				latlng: { lat: e.latlng.lat, lng: e.latlng.lng },
			});
		},
		[config.id, config.clickable, config.sourceLayer],
	);

	useEffect(() => {
		if (!visible || !config.clickable) return;
		map.on("click", handleClick);
		return () => {
			map.off("click", handleClick);
		};
	}, [visible, config.clickable, map, handleClick]);

	return null;
});
