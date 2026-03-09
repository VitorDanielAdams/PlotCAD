import type { Map } from "maplibre-gl";
import { createContext, useContext } from "react";

const MapContext = createContext<Map | null>(null);

export function MapProvider({ map, children }: { map: Map; children: React.ReactNode }) {
	return <MapContext.Provider value={map}>{children}</MapContext.Provider>;
}

export function useMap(): Map {
	const map = useContext(MapContext);
	if (!map) throw new Error("useMap must be used within a MapProvider");
	return map;
}
