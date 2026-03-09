import type { MapLayerConfig, MapLayerGroup } from "../types/map.types";

const TILES_BASE = import.meta.env.VITE_TILES_BASE_URL ?? "/tiles";

export const MAP_LAYERS: MapLayerConfig[] = [
	// ── CAR ──────────────────────────────────────────────
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
			{ key: "cod_imovel", label: "Nº SICAR", format: "text" },
			{ key: "nom_imovel", label: "Nome do Imóvel", format: "text" },
			{ key: "num_area", label: "Área Total (ha)", format: "area" },
			{ key: "num_matricula", label: "Matrícula", format: "text" },
			{ key: "municipio", label: "Município", format: "text" },
			{ key: "cod_estado", label: "UF", format: "text" },
			{ key: "ind_tipo", label: "Tipo do Imóvel", format: "propertyType" },
			{ key: "des_condic", label: "Condição", format: "condition" },
			{ key: "dat_criaca", label: "Data de Cadastro", format: "date" },
		],
		kmlConfig: {
			identifierKey: "cod_imovel",
			identifierLabel: "Nº SICAR",
			geometryFetcher: "car",
		},
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
		clickable: true,
		fields: [
			{ key: "cod_imovel", label: "Nº SICAR", format: "text" },
			{ key: "num_area", label: "Área (ha)", format: "area" },
			{ key: "municipio", label: "Município", format: "text" },
			{ key: "cod_estado", label: "UF", format: "text" },
			{ key: "des_tp_rrl", label: "Tipo", format: "text" },
		],
		kmlConfig: {
			identifierKey: "cod_imovel",
			identifierLabel: "Nº SICAR",
			geometryFetcher: "car",
		},
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

	// ── SIGEF ────────────────────────────────────────────
	{
		id: "sigef_parcelas",
		group: "sigef",
		label: "Parcelas Certificadas (SIGEF)",
		url: `${TILES_BASE}/sigef_parcelas_pr.pmtiles`,
		sourceLayer: "sigef_parcelas",
		minZoom: 8,
		maxZoom: 16,
		style: {
			fillColor: "#7b2d8e",
			fillOpacity: 0.15,
			strokeColor: "#7b2d8e",
			strokeWidth: 1.5,
		},
		clickable: true,
		fields: [
			{ key: "nome_imovel", label: "Nome do Imóvel", format: "text" },
			{ key: "codigo_incra", label: "Código INCRA", format: "text" },
			{ key: "matricula", label: "Matrícula", format: "text" },
			{ key: "status_registro", label: "Status de Registro", format: "text" },
			{ key: "codigo_profissional", label: "Código do Profissional", format: "text" },
			{ key: "numero_certificacao", label: "Nº Certificação", format: "text" },
		],
		kmlConfig: {
			identifierKey: "parcela_codigo",
			identifierLabel: "Código SIGEF",
			geometryFetcher: "sigef",
		},
	},

	// ── SNCI ─────────────────────────────────────────────
	{
		id: "snci_parcelas",
		group: "snci",
		label: "Parcelas Certificadas (SNCI)",
		url: `${TILES_BASE}/snci_parcelas_pr.pmtiles`,
		sourceLayer: "snci_parcelas",
		minZoom: 8,
		maxZoom: 16,
		style: {
			fillColor: "#c4a535",
			fillOpacity: 0.15,
			strokeColor: "#c4a535",
			strokeWidth: 1.5,
		},
		clickable: true,
		fields: [
			{ key: "nome_imovel", label: "Nome do Imóvel", format: "text" },
			{ key: "codigo_incra", label: "Código INCRA", format: "text" },
			{ key: "numero_certificacao", label: "Nº Certificação", format: "text" },
			{ key: "area_certificada", label: "Área Certificada (ha)", format: "area" },
			{ key: "codigo_profissional", label: "Código do Profissional", format: "text" },
		],
		kmlConfig: {
			identifierKey: "parcela_codigo",
			identifierLabel: "Código SNCI",
			geometryFetcher: "snci",
		},
	},
];

export const LAYER_GROUPS: MapLayerGroup[] = [
	{ id: "car", label: "CAR", description: "Cadastro Ambiental Rural" },
	{ id: "sigef", label: "SIGEF", description: "Sistema de Gestão Fundiária (INCRA)" },
	{ id: "snci", label: "SNCI", description: "Certificação de Imóveis (INCRA)" },
];
