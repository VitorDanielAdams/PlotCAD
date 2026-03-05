export interface MapLayerStyle {
	fillColor: string;
	fillOpacity: number;
	strokeColor: string;
	strokeWidth: number;
}

export interface MapLayerField {
	key: string;
	label: string;
	format?: "text" | "number" | "date" | "area" | "propertyType" | "condition";
}

export interface MapLayerConfig {
	id: string;
	group: string;
	label: string;
	url: string;
	sourceLayer: string;
	minZoom: number;
	maxZoom: number;
	style: MapLayerStyle;
	clickable: boolean;
	fields?: MapLayerField[];
}

export interface MapLayerGroup {
	id: string;
	label: string;
	description: string;
}

export interface MapFeatureProperties {
	[key: string]: string | number | null;
}

export interface SelectedFeature {
	layerId: string;
	properties: MapFeatureProperties;
	latlng: { lat: number; lng: number };
}
