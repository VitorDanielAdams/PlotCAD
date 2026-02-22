import { Eye, EyeOff, Maximize2, Scan } from "lucide-react";
import type { Dispatch, MouseEvent, RefObject, SetStateAction } from "react";
import type { ISegment } from "../LandDraw.types";

interface Props {
	canvasRef: RefObject<HTMLCanvasElement | null>;
	canvasHandlers: {
		onMouseDown: (e: MouseEvent<HTMLCanvasElement>) => void;
		onMouseMove: (e: MouseEvent<HTMLCanvasElement>) => void;
		onMouseUp: (e: MouseEvent<HTMLCanvasElement>) => void;
		onMouseLeave: (e: MouseEvent<HTMLCanvasElement>) => void;
	};
	isClosed: boolean;
	segments: ISegment[];
	zoomDisplay: number;
	showLabels: boolean;
	toggleShowLabels: () => void;
	fitToView: () => void;
	fullscreen: boolean;
	setFullscreen: Dispatch<SetStateAction<boolean>>;
}

const CanvasOverlay = ({
	canvasRef,
	canvasHandlers,
	isClosed,
	segments,
	zoomDisplay,
	showLabels,
	toggleShowLabels,
	fitToView,
	fullscreen,
	setFullscreen,
}: Props) => (
	<div
		className={`flex flex-col flex-1 bg-[#0f172a] relative transition-all duration-300 ${
			fullscreen ? "w-full" : ""
		}`}
	>
		<div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
			<span className="text-xs font-mono text-green-400 bg-black/40 px-2 py-1 rounded">
				PlotCAD — Vista Topográfica
			</span>
			{isClosed && (
				<span className="text-xs font-mono text-emerald-300 bg-black/40 px-2 py-1 rounded">
					FECHADO
				</span>
			)}
			{!isClosed && segments.length > 1 && (
				<span className="text-xs font-mono text-yellow-400 bg-black/40 px-2 py-1 rounded">
					ABERTO
				</span>
			)}
		</div>

		<div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
			<span className="text-xs font-mono text-white/40 bg-black/30 px-2 py-1 rounded select-none">
				{zoomDisplay}×
			</span>
			<button
				onClick={toggleShowLabels}
				title={showLabels ? "Ocultar nomes dos segmentos" : "Mostrar nomes dos segmentos"}
				className="p-1.5 text-white/50 hover:text-white bg-black/30 hover:bg-black/50 rounded transition-colors"
			>
				{showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
			</button>
			<button
				onClick={fitToView}
				title="Ajustar vista (encaixar tudo)"
				className="p-1.5 text-white/50 hover:text-white bg-black/30 hover:bg-black/50 rounded transition-colors"
			>
				<Scan className="h-4 w-4" />
			</button>
			<button
				onClick={() => setFullscreen((f) => !f)}
				title="Tela cheia"
				className="p-1.5 text-white/50 hover:text-white bg-black/30 hover:bg-black/50 rounded transition-colors"
			>
				<Maximize2 className="h-4 w-4" />
			</button>
		</div>

		<div className="absolute bottom-3 left-3 z-10 pointer-events-none">
			<span className="text-[10px] font-mono text-white/20 select-none">
				Arraste para mover · Scroll para zoom
			</span>
		</div>

		<canvas
			ref={canvasRef}
			className="w-full h-full cursor-grab"
			style={{ display: "block" }}
			{...canvasHandlers}
		/>
	</div>
);

export default CanvasOverlay;
