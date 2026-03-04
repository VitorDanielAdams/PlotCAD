import proj4 from "proj4";

export type Hemisphere = "N" | "S";

export function utmToLatLng(
	zone: number,
	hemisphere: Hemisphere,
	easting: number,
	northing: number,
): { lat: number; lng: number } {
	const utmProj = `+proj=utm +zone=${zone} ${
		hemisphere === "S" ? "+south" : ""
	} +datum=WGS84`;
	const [lng, lat] = proj4(utmProj, "EPSG:4326", [easting, northing]);
	return { lat, lng };
}

export function validateUtmZone(zone: number): boolean {
	return Number.isInteger(zone) && zone >= 1 && zone <= 60;
}

export function validateUtmEasting(easting: number): boolean {
	return easting >= 100000 && easting <= 999999;
}

export function validateUtmNorthing(northing: number): boolean {
	return northing >= 0 && northing <= 10000000;
}
