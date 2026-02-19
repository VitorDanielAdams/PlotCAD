import { Plus } from "lucide-react"
import { MAX_SEGMENTS } from "../LandDraw.hooks"

type ActiveTab = "segments" | "registration"

interface Props {
  segmentCount: number
  areaM2: number | null
  activeTab: ActiveTab
  onAddSegment: () => void
}

const SidenavHeader = ({ segmentCount, areaM2, activeTab, onAddSegment }: Props) => (
  <div className="bg-[#15803d] text-white px-4 py-3 flex items-center justify-between">
    <div>
      <h2 className="text-sm font-semibold">Nova Matrícula</h2>
      <p className="text-xs text-white/70 mt-0.5">
        {segmentCount} segmento{segmentCount !== 1 ? "s" : ""}
        {areaM2 !== null ? ` · ${areaM2.toFixed(2)} m²` : ""}
      </p>
    </div>
    {activeTab === "segments" && (
      <button
        onClick={onAddSegment}
        disabled={segmentCount >= MAX_SEGMENTS}
        title={segmentCount >= MAX_SEGMENTS ? `Limite de ${MAX_SEGMENTS} segmentos atingido` : undefined}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[#15803d] text-xs font-semibold rounded hover:bg-green-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-3.5 w-3.5" />
        SEGMENTO
      </button>
    )}
  </div>
)

export default SidenavHeader
