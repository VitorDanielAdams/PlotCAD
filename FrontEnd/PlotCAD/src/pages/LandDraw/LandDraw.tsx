import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createLand, getLandById, updateLand } from "../../api/Land";
import KmlExportModal from "../../components/KmlExportModal";
import type { ICreateLandRequest } from "../../types/land.types";
import { useLandDraw } from "./LandDraw.hooks";
import type { LandDrawMode } from "./LandDraw.types";
import CanvasOverlay from "./components/CanvasOverlay";
import LandDrawSidenav from "./components/LandDrawSidenav";

interface Props {
	mode: LandDrawMode;
}

const LandDraw = ({ mode }: Props) => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [showKmlExport, setShowKmlExport] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [pageLoading, setPageLoading] = useState(mode !== "new");

	const {
		segments,
		openSegmentId,
		toggleSegment,
		registration,
		updateRegistration,
		loadLand,
		fullscreen,
		setFullscreen,
		showLabels,
		toggleShowLabels,
		canvasRef,
		isClosed,
		areaM2,
		perimeter,
		zoomDisplay,
		fitToView,
		addSegment,
		removeSegment,
		updateSegment,
		updateBearingRaw,
		formatBearing,
		canvasHandlers,
	} = useLandDraw();

	useEffect(() => {
		if (mode === "new" || !id) return;

		setPageLoading(true);
		getLandById(Number(id))
			.then((response) => {
				if (response?.data) {
					loadLand(response.data);
				}
			})
			.finally(() => setPageLoading(false));
	}, [id, mode]);

	const handleSave = async () => {
		setSaveError(null);
		if (!registration.name.trim()) {
			setSaveError("O nome da matrícula é obrigatório.");
			return;
		}
		if (!registration.registrationNumber.trim()) {
			setSaveError("O número de registro é obrigatório.");
			return;
		}

		const body: ICreateLandRequest = {
			name: registration.name.trim(),
			registrationNumber: registration.registrationNumber.trim(),
			location: registration.location.trim(),
			client: registration.client.trim() || undefined,
			notes: registration.notes.trim() || undefined,
			totalArea: areaM2 ?? 0,
			perimeter,
			isClosed,
			isActive: true,
			segments: segments.map((s, i) => ({
				sortOrder: i + 1,
				fromDirection: s.from,
				toDirection: s.to,
				degrees: s.degrees,
				minutes: s.minutes,
				seconds: s.seconds,
				distance: s.distance,
				label: s.label,
				bearingRaw: s.bearingRaw,
			})),
		};

		setSaveLoading(true);
		try {
			if (mode === "edit" && id) {
				await updateLand(Number(id), { ...body, id: Number(id) });
			} else {
				await createLand(body);
			}
			navigate("/v1/matriculas");
		} catch (e: any) {
			setSaveError(e?.message ?? "Erro ao salvar matrícula.");
		} finally {
			setSaveLoading(false);
		}
	};

	if (pageLoading) {
		return (
			<div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50">
				<div className="flex items-center gap-3 text-gray-500">
					<svg
						className="animate-spin h-5 w-5"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
					</svg>
					<span className="text-sm">Carregando matrícula...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
			<CanvasOverlay
				canvasRef={canvasRef}
				canvasHandlers={canvasHandlers}
				isClosed={isClosed}
				segments={segments}
				zoomDisplay={zoomDisplay}
				showLabels={showLabels}
				toggleShowLabels={toggleShowLabels}
				fitToView={fitToView}
				fullscreen={fullscreen}
				setFullscreen={setFullscreen}
			/>
			{!fullscreen && (
				<LandDrawSidenav
					mode={mode}
					segments={segments}
					openSegmentId={openSegmentId}
					toggleSegment={toggleSegment}
					registration={registration}
					updateRegistration={updateRegistration}
					isClosed={isClosed}
					areaM2={areaM2}
					perimeter={perimeter}
					addSegment={addSegment}
					removeSegment={removeSegment}
					updateSegment={updateSegment}
					updateBearingRaw={updateBearingRaw}
					formatBearing={formatBearing}
					onSave={handleSave}
					saveLoading={saveLoading}
					saveError={saveError}
					onCancel={() => navigate("/v1/matriculas")}
					onExportKml={() => setShowKmlExport(true)}
				/>
			)}
			<KmlExportModal
				isOpen={showKmlExport}
				onClose={() => setShowKmlExport(false)}
				segments={segments}
				landName={registration.name}
				isClosed={isClosed}
			/>
		</div>
	);
};

export default LandDraw;
