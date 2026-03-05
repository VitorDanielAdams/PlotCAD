import { FileDown, Loader2, Pencil, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { MAX_SEGMENTS } from "../../LandDraw.hooks";
import type { IRegistration, ISegment, LandDrawMode } from "../../LandDraw.types";
import RegistrationTab from "./RegistrationTab";
import SegmentsTab from "./SegmentsTab";

type ActiveTab = "segments" | "registration";

const TITLE: Record<LandDrawMode, string> = {
	new: "Nova Matrícula",
	edit: "Editar Matrícula",
	view: "Visualizar Matrícula",
};

interface Props {
	mode: LandDrawMode;
	segments: ISegment[];
	openSegmentId: string | null;
	toggleSegment: (id: string) => void;
	registration: IRegistration;
	updateRegistration: (field: keyof IRegistration, value: string) => void;
	isClosed: boolean;
	areaM2: number | null;
	perimeter: number;
	addSegment: () => void;
	removeSegment: (id: string) => void;
	updateSegment: (id: string, field: keyof ISegment, value: string | number) => void;
	updateBearingRaw: (id: string, raw: string) => void;
	formatBearing: (seg: ISegment) => string;
	onSave: () => void;
	saveLoading: boolean;
	saveError: string | null;
	onCancel: () => void;
	onExportKml: () => void;
}

const LandDrawSidenav = ({
	mode,
	segments,
	openSegmentId,
	toggleSegment,
	registration,
	updateRegistration,
	isClosed,
	areaM2,
	perimeter,
	addSegment,
	removeSegment,
	updateSegment,
	updateBearingRaw,
	formatBearing,
	onSave,
	saveLoading,
	saveError,
	onCancel,
	onExportKml,
}: Props) => {
	const [activeTab, setActiveTab] = useState<ActiveTab>("segments");
	const readOnly = mode === "view";

	return (
		<div className="w-[340px] min-w-[300px] bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl">
			<div className="bg-[#15803d] text-white px-4 py-3 flex items-center justify-between">
				<div>
					<h2 className="text-sm font-semibold">{TITLE[mode]}</h2>
					<p className="text-xs text-white/70 mt-0.5">
						{segments.length} segmento{segments.length !== 1 ? "s" : ""}
						{areaM2 !== null ? ` · ${areaM2.toFixed(2)} m²` : ""}
					</p>
				</div>
				{activeTab === "segments" && !readOnly && (
					<button
						onClick={addSegment}
						disabled={segments.length >= MAX_SEGMENTS}
						title={
							segments.length >= MAX_SEGMENTS
								? `Limite de ${MAX_SEGMENTS} segmentos atingido`
								: undefined
						}
						className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[#15803d] text-xs font-semibold rounded hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
					>
						<Plus className="h-3.5 w-3.5" />
						SEGMENTO
					</button>
				)}
			</div>

			<div className="flex border-b border-gray-200 bg-white">
				<button
					onClick={() => setActiveTab("segments")}
					className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
						activeTab === "segments"
							? "text-green-700 border-b-2 border-green-600"
							: "text-gray-400 hover:text-gray-600"
					}`}
				>
					Segmentos
				</button>
				<button
					onClick={() => setActiveTab("registration")}
					className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
						activeTab === "registration"
							? "text-green-700 border-b-2 border-green-600"
							: "text-gray-400 hover:text-gray-600"
					}`}
				>
					Matrícula
				</button>
			</div>

			{activeTab === "segments" && (
				<SegmentsTab
					segments={segments}
					openSegmentId={openSegmentId}
					toggleSegment={toggleSegment}
					removeSegment={removeSegment}
					updateSegment={updateSegment}
					updateBearingRaw={updateBearingRaw}
					formatBearing={formatBearing}
					readOnly={readOnly}
				/>
			)}
			{activeTab === "registration" && (
				<RegistrationTab
					registration={registration}
					updateRegistration={updateRegistration}
					readOnly={readOnly}
				/>
			)}

			<div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
				{saveError && (
					<div className="rounded bg-red-50 border border-red-200 px-3 py-2">
						<p className="text-xs text-red-600">{saveError}</p>
					</div>
				)}
				<div className="grid grid-cols-2 gap-3 text-xs">
					<div className="bg-white rounded border border-gray-200 px-3 py-2">
						<p className="text-gray-400 mb-0.5">Segmentos</p>
						<p className="font-semibold text-gray-800 font-mono">{segments.length}</p>
					</div>
					<div className="bg-white rounded border border-gray-200 px-3 py-2">
						<p className="text-gray-400 mb-0.5">Área</p>
						<p
							className={`font-semibold font-mono ${
								isClosed ? "text-green-700" : "text-gray-400"
							}`}
						>
							{isClosed && areaM2 !== null ? `${areaM2.toFixed(2)} m²` : "—"}
						</p>
					</div>
					<div className="bg-white rounded border border-gray-200 px-3 py-2">
						<p className="text-gray-400 mb-0.5">Perímetro</p>
						<p className="font-semibold text-gray-800 font-mono">
							{perimeter.toFixed(2)} m
						</p>
					</div>
					<div className="bg-white rounded border border-gray-200 px-3 py-2">
						<p className="text-gray-400 mb-0.5">Status</p>
						<p
							className={`font-semibold font-mono text-xs ${
								isClosed ? "text-green-700" : "text-yellow-600"
							}`}
						>
							{isClosed ? "Fechado" : "Aberto"}
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						onClick={onExportKml}
						className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded border border-gray-300 transition-colors w-full"
					>
						<FileDown className="h-3.5 w-3.5" />
						Exportar KML
					</button>
				</div>
				<div className="flex gap-2">
					{readOnly ? (
						<button
							onClick={onCancel}
							className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded border border-gray-300 transition-colors"
						>
							<X className="h-3.5 w-3.5" />
							Fechar
						</button>
					) : (
						<>
							<button
								onClick={onSave}
								disabled={saveLoading}
								className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#15803d] hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
							>
								{saveLoading ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<>
										{mode === "edit" ? (
											<Pencil className="h-3.5 w-3.5" />
										) : (
											<Save className="h-3.5 w-3.5" />
										)}
									</>
								)}
								{mode === "edit" ? "Atualizar" : "Salvar Matrícula"}
							</button>
							<button
								onClick={onCancel}
								disabled={saveLoading}
								className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded border border-gray-300 transition-colors disabled:opacity-60"
							>
								<X className="h-3.5 w-3.5" />
								Cancelar
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default LandDrawSidenav;
