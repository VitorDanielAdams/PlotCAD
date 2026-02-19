import { Save, X } from "lucide-react"

interface Props {
  segmentCount: number
  isClosed: boolean
  areaM2: number | null
  perimeter: number
  onSave: () => void
  onCancel: () => void
}

const SidenavFooter = ({ segmentCount, isClosed, areaM2, perimeter, onSave, onCancel }: Props) => (
  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="bg-white rounded border border-gray-200 px-3 py-2">
        <p className="text-gray-400 mb-0.5">Segmentos</p>
        <p className="font-semibold text-gray-800 font-mono">{segmentCount}</p>
      </div>
      <div className="bg-white rounded border border-gray-200 px-3 py-2">
        <p className="text-gray-400 mb-0.5">Área</p>
        <p className={`font-semibold font-mono ${isClosed ? "text-green-700" : "text-gray-400"}`}>
          {isClosed && areaM2 !== null ? `${areaM2.toFixed(2)} m²` : "—"}
        </p>
      </div>
      <div className="bg-white rounded border border-gray-200 px-3 py-2">
        <p className="text-gray-400 mb-0.5">Perímetro</p>
        <p className="font-semibold text-gray-800 font-mono">{perimeter.toFixed(2)} m</p>
      </div>
      <div className="bg-white rounded border border-gray-200 px-3 py-2">
        <p className="text-gray-400 mb-0.5">Status</p>
        <p className={`font-semibold font-mono text-xs ${isClosed ? "text-green-700" : "text-yellow-600"}`}>
          {isClosed ? "Fechado" : "Aberto"}
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={onSave}
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#15803d] hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
      >
        <Save className="h-3.5 w-3.5" />
        Salvar Matrícula
      </button>
      <button
        onClick={onCancel}
        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded border border-gray-300 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
        Cancelar
      </button>
    </div>
  </div>
)

export default SidenavFooter
