import { AlertTriangle, Download, X } from "lucide-react";
import { useState } from "react";
import type { Hemisphere } from "../../utils/coordinates";
import {
	utmToLatLng,
	validateUtmEasting,
	validateUtmNorthing,
	validateUtmZone,
} from "../../utils/coordinates";
import { buildKml, computeGeoVertices, downloadKml } from "../../utils/kml";
import type { IKmlExportModalProps } from "./KmlExportModal.types";

type CoordType = "latlong" | "utm";

const inputClass =
	"w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono placeholder:font-sans placeholder:text-gray-400";

const tabBase =
	"flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors text-center";

const KmlExportModal = ({
	isOpen,
	onClose,
	segments,
	landName,
	isClosed,
}: IKmlExportModalProps) => {
	const [coordType, setCoordType] = useState<CoordType>("latlong");
	const [lat, setLat] = useState("");
	const [lng, setLng] = useState("");
	const [utmZone, setUtmZone] = useState("");
	const [utmHemisphere, setUtmHemisphere] = useState<Hemisphere>("S");
	const [utmEasting, setUtmEasting] = useState("");
	const [utmNorthing, setUtmNorthing] = useState("");
	const [error, setError] = useState<string | null>(null);

	if (!isOpen) return null;

	const resolveOrigin = (): { lat: number; lng: number } | null => {
		if (coordType === "latlong") {
			const latNum = parseFloat(lat.replace(",", "."));
			const lngNum = parseFloat(lng.replace(",", "."));

			if (isNaN(latNum) || latNum < -90 || latNum > 90) {
				setError("Latitude inválida. Use graus decimais entre -90 e 90.");
				return null;
			}
			if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
				setError("Longitude inválida. Use graus decimais entre -180 e 180.");
				return null;
			}
			return { lat: latNum, lng: lngNum };
		}

		const zone = parseInt(utmZone, 10);
		const easting = parseFloat(utmEasting.replace(",", "."));
		const northing = parseFloat(utmNorthing.replace(",", "."));

		if (isNaN(zone) || !validateUtmZone(zone)) {
			setError("Zona UTM inválida. Use um valor inteiro entre 1 e 60.");
			return null;
		}
		if (isNaN(easting) || !validateUtmEasting(easting)) {
			setError("Easting inválido. Use um valor entre 100.000 e 999.999 metros.");
			return null;
		}
		if (isNaN(northing) || !validateUtmNorthing(northing)) {
			setError("Northing inválido. Use um valor entre 0 e 10.000.000 metros.");
			return null;
		}

		return utmToLatLng(zone, utmHemisphere, easting, northing);
	};

	const handleExport = () => {
		setError(null);

		if (segments.length === 0) {
			setError("Nenhum segmento definido para exportar.");
			return;
		}

		const origin = resolveOrigin();
		if (!origin) return;

		const vertices = computeGeoVertices(segments, origin.lat, origin.lng);
		const filename = (landName?.trim() || "matricula").replace(/[^a-z0-9_\-]/gi, "_");
		const kml = buildKml(landName?.trim() || "Matrícula", vertices);
		downloadKml(filename, kml);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/50" onClick={onClose} />
			<div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
					<div>
						<h2 className="text-sm font-semibold text-gray-900">Exportar KML</h2>
						{landName && (
							<p className="text-xs text-gray-400 mt-0.5 truncate max-w-[300px]">
								{landName}
							</p>
						)}
					</div>
					<button
						onClick={onClose}
						className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="px-5 py-4 space-y-4">
					{!isClosed && (
						<div className="flex items-start gap-2 px-3 py-2.5 bg-yellow-50 border border-yellow-200 rounded-md">
							<AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
							<p className="text-xs text-yellow-700">
								O polígono não está fechado. O KML será gerado com os vértices
								disponíveis.
							</p>
						</div>
					)}

					<p className="text-xs text-gray-500">
						Informe as coordenadas do <strong>primeiro vértice</strong> do levantamento
						(marco inicial). Os demais vértices serão calculados a partir dos rumos e
						distâncias.
					</p>

					{/* Coordinate type toggle */}
					<div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
						<button
							type="button"
							onClick={() => {
								setCoordType("latlong");
								setError(null);
							}}
							className={`${tabBase} ${
								coordType === "latlong"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Lat / Long
						</button>
						<button
							type="button"
							onClick={() => {
								setCoordType("utm");
								setError(null);
							}}
							className={`${tabBase} ${
								coordType === "utm"
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							UTM
						</button>
					</div>

					{coordType === "latlong" ? (
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Latitude <span className="text-gray-400 font-normal">(decimal)</span>
								</label>
								<input
									type="text"
									value={lat}
									onChange={(e) => {
										setLat(e.target.value);
										setError(null);
									}}
									placeholder="-23.550520"
									className={inputClass}
								/>
							</div>
							<div>
								<label className="block text-xs font-medium text-gray-600 mb-1">
									Longitude <span className="text-gray-400 font-normal">(decimal)</span>
								</label>
								<input
									type="text"
									value={lng}
									onChange={(e) => {
										setLng(e.target.value);
										setError(null);
									}}
									placeholder="-46.633308"
									className={inputClass}
								/>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">
										Zona <span className="text-gray-400 font-normal">(1-60)</span>
									</label>
									<input
										type="text"
										value={utmZone}
										onChange={(e) => {
											setUtmZone(e.target.value);
											setError(null);
										}}
										placeholder="22"
										className={inputClass}
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">
										Hemisfério
									</label>
									<div className="flex gap-1 p-1 bg-gray-100 rounded-md">
										<button
											type="button"
											onClick={() => setUtmHemisphere("S")}
											className={`${tabBase} ${
												utmHemisphere === "S"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-500 hover:text-gray-700"
											}`}
										>
											Sul (S)
										</button>
										<button
											type="button"
											onClick={() => setUtmHemisphere("N")}
											className={`${tabBase} ${
												utmHemisphere === "N"
													? "bg-white text-gray-900 shadow-sm"
													: "text-gray-500 hover:text-gray-700"
											}`}
										>
											Norte (N)
										</button>
									</div>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">
										Easting <span className="text-gray-400 font-normal">(m)</span>
									</label>
									<input
										type="text"
										value={utmEasting}
										onChange={(e) => {
											setUtmEasting(e.target.value);
											setError(null);
										}}
										placeholder="500000"
										className={inputClass}
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">
										Northing <span className="text-gray-400 font-normal">(m)</span>
									</label>
									<input
										type="text"
										value={utmNorthing}
										onChange={(e) => {
											setUtmNorthing(e.target.value);
											setError(null);
										}}
										placeholder="7394000"
										className={inputClass}
									/>
								</div>
							</div>
						</div>
					)}

					{error && (
						<p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
							{error}
						</p>
					)}

					<p className="text-xs text-gray-400">
						{segments.length} segmento{segments.length !== 1 ? "s" : ""} · o arquivo será
						salvo como <span className="font-mono">.kml</span> compatível com Google
						Earth, QGIS e AutoCAD Map.
					</p>
				</div>

				<div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
					<button
						onClick={onClose}
						className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-200 rounded-md transition-colors"
					>
						Cancelar
					</button>
					<button
						onClick={handleExport}
						className="flex items-center gap-2 px-4 py-2 text-sm bg-[#15803d] hover:bg-green-700 text-white font-medium rounded-md transition-colors"
					>
						<Download className="h-3.5 w-3.5" />
						Exportar
					</button>
				</div>
			</div>
		</div>
	);
};

export default KmlExportModal;
