import type { MapLayerConfig, MapLayerGroup } from "../types/map.types";

const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? "/tiles";

export const MAP_LAYERS: MapLayerConfig[] = [
	{
		id: "car_area_imovel",
		group: "car",
		label: "Imóvel Rural (CAR)",
		url: `${TILES_BASE}/car_area_imovel_pr.pmtiles`,
		sourceLayer: "area_imovel",
		minZoom: 8,
		maxZoom: 16,
		style: {
			fillColor: "#e8730c",
			fillOpacity: 0.15,
			strokeColor: "#e8730c",
			strokeWidth: 1.5,
		},
		clickable: true,
		fields: [
			{ key: "cod_imovel", label: "Código CAR", format: "text" },
			{ key: "num_area", label: "Área Total (ha)", format: "area" },
			{ key: "municipio", label: "Município", format: "text" },
			{ key: "cod_estado", label: "UF", format: "text" },
			{ key: "ind_tipo", label: "Tipo do Imóvel", format: "propertyType" },
			{ key: "des_condic", label: "Condição", format: "text" },
			{ key: "dat_criaca", label: "Data de Cadastro", format: "date" },
		],
	},
	{
		id: "car_reserva_legal",
		group: "car",
		label: "Reserva Legal",
		url: `${TILES_BASE}/car_reserva_legal_pr.pmtiles`,
		sourceLayer: "reserva_legal",
		minZoom: 8,
		maxZoom: 16,
		style: {
			fillColor: "#2d7a2d",
			fillOpacity: 0.2,
			strokeColor: "#2d7a2d",
			strokeWidth: 1,
		},
		clickable: false,
		fields: [],
	},
	{
		id: "car_app",
		group: "car",
		label: "APP",
		url: `${TILES_BASE}/car_app_pr.pmtiles`,
		sourceLayer: "app",
		minZoom: 8,
		maxZoom: 16,
		style: {
			fillColor: "#1a6b8a",
			fillOpacity: 0.2,
			strokeColor: "#1a6b8a",
			strokeWidth: 1,
		},
		clickable: false,
		fields: [],
	},
];

export const LAYER_GROUPS: MapLayerGroup[] = [
	{ id: "car", label: "CAR", description: "Cadastro Ambiental Rural" },
];
