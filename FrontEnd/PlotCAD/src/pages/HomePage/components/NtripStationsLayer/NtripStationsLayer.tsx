import type maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";

export interface NtripFeature {
	properties: {
		id: string;
		nome: string;
		uf: string;
		municipio: string;
		latitude: number;
		longitude: number;
		altitude: number | null;
		status: string;
	};
	latlng: { lat: number; lng: number };
}

interface NtripStationsLayerProps {
	onFeatureSelect: (feature: NtripFeature | null) => void;
	onLoadingChange?: (loading: boolean) => void;
	onError?: (msg: string | null) => void;
}

const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? "/tiles";
const SOURCE_ID = "rbmc-stations";
const CIRCLE_ID = "rbmc-stations-circle";
const LABEL_ID = "rbmc-stations-label";

export default function NtripStationsLayer({
	onFeatureSelect,
	onLoadingChange,
	onError,
}: NtripStationsLayerProps) {
	const map = useMap();
	const addedRef = useRef(false);
	const [ready, setReady] = useState(false);

	// Add PMTiles source + layers once on mount
	useEffect(() => {
		if (addedRef.current) return;

		onLoadingChange?.(true);
		onError?.(null);

		const url = `pmtiles://${TILES_BASE}/rbmc_stations.pmtiles`;

		map.addSource(SOURCE_ID, {
			type: "vector",
			url,
			minzoom: 4,
			maxzoom: 14,
		});

		// Circle layer
		map.addLayer({
			id: CIRCLE_ID,
			type: "circle",
			source: SOURCE_ID,
			"source-layer": "rbmc_stations",
			paint: {
				"circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 4, 8, 7, 12, 10],
				"circle-color": "#0ea5e9",
				"circle-stroke-width": 2,
				"circle-stroke-color": "#ffffff",
				"circle-opacity": [
					"case",
					["==", ["upcase", ["get", "status"]], "INATIVA"],
					0.4,
					1,
				],
			},
		});

		// Label layer
		map.addLayer({
			id: LABEL_ID,
			type: "symbol",
			source: SOURCE_ID,
			"source-layer": "rbmc_stations",
			minzoom: 5,
			layout: {
				"text-field": ["get", "id"],
				"text-size": 10,
				"text-offset": [0, 1.4],
				"text-anchor": "top",
				"text-font": ["Open Sans Regular"],
			},
			paint: {
				"text-color": "#0369a1",
				"text-halo-color": "#ffffff",
				"text-halo-width": 1.5,
			},
		});

		addedRef.current = true;

		// Detect load errors
		const handleError = (e: { sourceId?: string }) => {
			if (e.sourceId === SOURCE_ID) {
				onError?.("Dados das estações NTRIP não disponíveis no momento.");
				onLoadingChange?.(false);
			}
		};

		// Detect when map becomes idle (all sources loaded)
		const handleIdle = () => {
			onLoadingChange?.(false);
			setReady(true);
			map.off("idle", handleIdle);
		};

		map.on("error", handleError as Parameters<typeof map.on>[1]);
		map.on("idle", handleIdle);

		return () => {
			map.off("error", handleError as Parameters<typeof map.on>[1]);
			map.off("idle", handleIdle);

			for (const id of [LABEL_ID, CIRCLE_ID]) {
				if (map.getLayer(id)) map.removeLayer(id);
			}
			if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
			addedRef.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	// Click handler (enabled after idle)
	useEffect(() => {
		if (!ready) return;

		const handleClick = (e: {
			point: maplibregl.PointLike;
			lngLat: maplibregl.LngLat;
		}) => {
			if (!map.getLayer(CIRCLE_ID)) return;
			const features = map.queryRenderedFeatures(e.point, {
				layers: [CIRCLE_ID],
			});
			if (features.length > 0) {
				const p = features[0].properties ?? {};
				onFeatureSelect({
					properties: {
						id: String(p.id ?? ""),
						nome: String(p.nome ?? ""),
						uf: String(p.uf ?? ""),
						municipio: String(p.municipio ?? ""),
						latitude: Number(p.latitude ?? 0),
						longitude: Number(p.longitude ?? 0),
						altitude: p.altitude != null ? Number(p.altitude) : null,
						status: String(p.status ?? ""),
					},
					latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng },
				});
				return;
			}
			onFeatureSelect(null);
		};

		const enterCursor = () => {
			map.getCanvas().style.cursor = "pointer";
		};
		const leaveCursor = () => {
			map.getCanvas().style.cursor = "";
		};

		map.on("click", handleClick as Parameters<typeof map.on>[1]);
		map.on("mouseenter", CIRCLE_ID, enterCursor);
		map.on("mouseleave", CIRCLE_ID, leaveCursor);

		return () => {
			map.off("click", handleClick as Parameters<typeof map.on>[1]);
			map.off("mouseenter", CIRCLE_ID, enterCursor);
			map.off("mouseleave", CIRCLE_ID, leaveCursor);
		};
	}, [map, ready, onFeatureSelect]);

	return null;
}
