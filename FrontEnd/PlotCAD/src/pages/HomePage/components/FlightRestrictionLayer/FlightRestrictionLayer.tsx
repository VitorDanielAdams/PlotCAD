import type maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useMap } from "../../../../contexts/MapContext";

export interface AirspaceFeature {
	type: "airspace" | "airport" | "heliport";
	properties: Record<string, string | number | null>;
	latlng: { lat: number; lng: number };
}

interface FlightRestrictionLayerProps {
	onFeatureSelect: (feature: AirspaceFeature | null) => void;
	onLoadingChange?: (loading: boolean) => void;
	onError?: (msg: string | null) => void;
}

const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? "/tiles";

const SOURCE_AIRSPACE = "decea-airspace";
const SOURCE_AIRPORTS = "decea-airports";

const FILL_ID = "decea-airspace-fill";
const STROKE_ID = "decea-airspace-stroke";
const AIRPORTS_CIRCLE_ID = "decea-airports-circle";
const AIRPORTS_LABEL_ID = "decea-airports-label";

export default function FlightRestrictionLayer({
	onFeatureSelect,
	onLoadingChange,
	onError,
}: FlightRestrictionLayerProps) {
	const map = useMap();
	const addedRef = useRef(false);
	const [ready, setReady] = useState(false);

	// Add PMTiles sources + layers once on mount
	useEffect(() => {
		if (addedRef.current) return;

		onLoadingChange?.(true);
		onError?.(null);

		const airspaceUrl = `pmtiles://${TILES_BASE}/decea_airspace.pmtiles`;
		const airportsUrl = `pmtiles://${TILES_BASE}/decea_airports.pmtiles`;

		map.addSource(SOURCE_AIRSPACE, {
			type: "vector",
			url: airspaceUrl,
			minzoom: 4,
			maxzoom: 14,
		});

		map.addLayer({
			id: FILL_ID,
			type: "fill",
			source: SOURCE_AIRSPACE,
			"source-layer": "decea_airspace",
			paint: {
				"fill-color": [
					"match",
					["get", "_decea_layer"],
					"area_proibida",
					"#cc0000",
					"area_restrita",
					"#e67e00",
					"area_perigosa",
					"#e6c800",
					"ctr",
					"#e63946",
					"tma",
					"#f4a261",
					"atz",
					"#f8c100",
					"fir",
					"#2196f3",
					"#888888",
				],
				"fill-opacity": [
					"match",
					["get", "_decea_layer"],
					"area_proibida",
					0.25,
					"area_restrita",
					0.2,
					"area_perigosa",
					0.18,
					"ctr",
					0.15,
					"tma",
					0.12,
					"atz",
					0.1,
					"fir",
					0.06,
					0.08,
				],
			},
		});

		map.addLayer({
			id: STROKE_ID,
			type: "line",
			source: SOURCE_AIRSPACE,
			"source-layer": "decea_airspace",
			paint: {
				"line-color": [
					"match",
					["get", "_decea_layer"],
					"area_proibida",
					"#cc0000",
					"area_restrita",
					"#e67e00",
					"area_perigosa",
					"#ccb800",
					"ctr",
					"#e63946",
					"tma",
					"#f4a261",
					"atz",
					"#f8c100",
					"fir",
					"#1976d2",
					"#555555",
				],
				"line-width": ["match", ["get", "_decea_layer"], "ctr", 2, "tma", 1.5, 1],
				"line-dasharray": [
					"match",
					["get", "_decea_layer"],
					"fir",
					["literal", [4, 2]],
					["literal", [1]],
				],
			},
		});

		// Airports source + layers
		map.addSource(SOURCE_AIRPORTS, {
			type: "vector",
			url: airportsUrl,
			minzoom: 4,
			maxzoom: 14,
		});

		map.addLayer({
			id: AIRPORTS_CIRCLE_ID,
			type: "circle",
			source: SOURCE_AIRPORTS,
			"source-layer": "decea_airports",
			paint: {
				"circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3, 8, 5, 12, 7],
				"circle-color": [
					"match",
					["get", "_decea_layer"],
					"heliport",
					"#7b2d8e",
					"#1e40af",
				],
				"circle-stroke-width": 1.5,
				"circle-stroke-color": "#ffffff",
			},
		});

		map.addLayer({
			id: AIRPORTS_LABEL_ID,
			type: "symbol",
			source: SOURCE_AIRPORTS,
			"source-layer": "decea_airports",
			minzoom: 7,
			layout: {
				"text-field": ["coalesce", ["get", "localidade_id"], ["get", "nam"]],
				"text-size": 10,
				"text-offset": [0, 1.2],
				"text-anchor": "top",
				"text-font": ["Open Sans Regular"],
			},
			paint: {
				"text-color": "#1e40af",
				"text-halo-color": "#ffffff",
				"text-halo-width": 1,
			},
		});

		addedRef.current = true;

		// Detect load errors (file not found / not yet generated)
		const handleError = (e: { error?: { message?: string }; sourceId?: string }) => {
			const id = (e as { sourceId?: string }).sourceId;
			if (id === SOURCE_AIRSPACE || id === SOURCE_AIRPORTS) {
				onError?.("Dados de restrição de voo não disponíveis no momento.");
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

			for (const id of [AIRPORTS_LABEL_ID, AIRPORTS_CIRCLE_ID, STROKE_ID, FILL_ID]) {
				if (map.getLayer(id)) map.removeLayer(id);
			}
			for (const id of [SOURCE_AIRSPACE, SOURCE_AIRPORTS]) {
				if (map.getSource(id)) map.removeSource(id);
			}
			addedRef.current = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [map]);

	// Click handler (enabled after idle)
	useEffect(() => {
		if (!ready) return;

		const clickableLayers = [FILL_ID, AIRPORTS_CIRCLE_ID].filter((id) =>
			map.getLayer(id),
		);

		const handleClick = (e: { point: maplibregl.Point; lngLat: maplibregl.LngLat }) => {
			for (const layerId of [...clickableLayers].reverse()) {
				if (!map.getLayer(layerId)) continue;
				const features = map.queryRenderedFeatures(e.point as maplibregl.PointLike, {
					layers: [layerId],
				});
				if (features.length > 0) {
					const f = features[0];
					const props: Record<string, string | number | null> = {};
					for (const [k, v] of Object.entries(f.properties ?? {})) {
						props[k] = v as string | number | null;
					}
					const layerKey = String(props._decea_layer ?? "");
					const type: AirspaceFeature["type"] =
						layerKey === "heliport"
							? "heliport"
							: layerKey === "airport"
							? "airport"
							: "airspace";
					onFeatureSelect({
						type,
						properties: props,
						latlng: { lat: e.lngLat.lat, lng: e.lngLat.lng },
					});
					return;
				}
			}
			onFeatureSelect(null);
		};

		const setCrosshair = () => {
			map.getCanvas().style.cursor = "crosshair";
		};
		const resetCursor = () => {
			map.getCanvas().style.cursor = "";
		};

		map.on("click", handleClick as Parameters<typeof map.on>[1]);
		for (const id of clickableLayers) {
			map.on("mouseenter", id, setCrosshair);
			map.on("mouseleave", id, resetCursor);
		}

		return () => {
			map.off("click", handleClick as Parameters<typeof map.on>[1]);
			for (const id of clickableLayers) {
				map.off("mouseenter", id, setCrosshair);
				map.off("mouseleave", id, resetCursor);
			}
		};
	}, [map, ready, onFeatureSelect]);

	return null;
}
