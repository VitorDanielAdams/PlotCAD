import type { CardinalDirection, IKmlSegment } from "../types/land.types";

const BEARING_ANGLES: Record<CardinalDirection, number> = {
	N: 0,
	NE: 45,
	E: 90,
	SE: 135,
	S: 180,
	SO: 225,
	O: 270,
	NO: 315,
};

function segmentToAzimuthRad(seg: IKmlSegment): number {
	const totalDeg = seg.degrees + seg.minutes / 60 + seg.seconds / 3600;
	const fromBase = BEARING_ANGLES[seg.from];
	const toBase = BEARING_ANGLES[seg.to];
	const delta = ((toBase - fromBase + 540) % 360) - 180;
	const sign = delta >= 0 ? 1 : -1;
	const azimuth = (((fromBase + sign * totalDeg) % 360) + 360) % 360;
	return (azimuth * Math.PI) / 180;
}

export function computeGeoVertices(
	segments: IKmlSegment[],
	originLat: number,
	originLng: number,
): { lat: number; lng: number }[] {
	const vertices: { lat: number; lng: number }[] = [{ lat: originLat, lng: originLng }];
	for (const seg of segments) {
		const azRad = segmentToAzimuthRad(seg);
		const northing = seg.distance * Math.cos(azRad);
		const easting = seg.distance * Math.sin(azRad);
		const prev = vertices[vertices.length - 1];
		const lat = prev.lat + northing / 111320;
		const lng = prev.lng + easting / (111320 * Math.cos((prev.lat * Math.PI) / 180));
		vertices.push({ lat, lng });
	}
	return vertices;
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function buildKml(
	name: string,
	vertices: { lat: number; lng: number }[],
	description?: string,
): string {
	const coordLines = vertices
		.map((v) => `              ${v.lng.toFixed(8)},${v.lat.toFixed(8)},0`)
		.join("\n");
	const closeCoord = `              ${vertices[0].lng.toFixed(
		8,
	)},${vertices[0].lat.toFixed(8)},0`;

	return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(name)}</name>
    <Style id="landStyle">
      <LineStyle>
        <color>ff228b3d</color>
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>2622c55e</color>
      </PolyStyle>
    </Style>
    <Placemark>
      <name>${escapeXml(name)}</name>
      ${description ? `<description>${escapeXml(description)}</description>` : ""}
      <styleUrl>#landStyle</styleUrl>
      <Polygon>
        <extrude>0</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${coordLines}
              ${closeCoord}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
}

export function downloadKml(filename: string, content: string): void {
	const blob = new Blob([content], { type: "application/vnd.google-earth.kml+xml" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename.endsWith(".kml") ? filename : `${filename}.kml`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
