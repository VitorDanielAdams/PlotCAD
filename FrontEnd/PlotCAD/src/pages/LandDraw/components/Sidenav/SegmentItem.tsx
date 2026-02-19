import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { CARDINAL_OPTIONS } from "../../LandDraw.hooks"
import type { ISegment, CardinalDirection } from "../../LandDraw.types"

interface Props {
  seg: ISegment
  index: number
  isOpen: boolean
  showDelete: boolean
  onToggle: () => void
  onRemove: () => void
  onUpdateField: (field: keyof ISegment, value: string | number) => void
  onUpdateBearingRaw: (raw: string) => void
  formatBearing: (seg: ISegment) => string
}

const inputClass =
  "w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"

const SegmentItem = ({
  seg,
  index,
  isOpen,
  showDelete,
  onToggle,
  onRemove,
  onUpdateField,
  onUpdateBearingRaw,
  formatBearing,
}: Props) => (
  <div className="bg-white">
    <button
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 flex items-center justify-center bg-green-100 text-green-700 text-xs font-bold rounded-full">
          {index + 1}
        </span>
        <div>
          <p className="text-xs font-mono font-semibold text-gray-800">{formatBearing(seg)}</p>
          <p className="text-xs text-gray-400">
            {seg.distance.toFixed(2)} m{seg.label ? ` · ${seg.label}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {showDelete && (
          <span
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onRemove() }}
            onKeyDown={e => e.key === "Enter" && onRemove()}
            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </span>
        )}
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </div>
    </button>

    {isOpen && (
      <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Nome do segmento</label>
          <input
            type="text"
            value={seg.label}
            onChange={e => onUpdateField("label", e.target.value)}
            placeholder="ex: Frente, Fundos, Lateral..."
            className={`${inputClass} placeholder:text-gray-300`}
            maxLength={40}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Rumo rápido</label>
          <input
            type="text"
            value={seg.bearingRaw}
            onChange={e => onUpdateBearingRaw(e.target.value)}
            placeholder="ex: SO1235NE ou SO123545NE"
            className={`${inputClass} font-mono placeholder:text-gray-300`}
            maxLength={12}
          />
          <p className="text-[10px] text-gray-400 mt-0.5">
            Digite o rumo completo — os campos abaixo são preenchidos automaticamente
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Rumo detalhado</label>
          <div className="flex items-center gap-2">
            <select
              value={seg.from}
              onChange={e => onUpdateField("from", e.target.value as CardinalDirection)}
              className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono"
            >
              {CARDINAL_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <div className="flex items-center gap-1 flex-1">
              <div className="flex flex-col items-center">
                <input
                  type="number" min={0} max={89} value={seg.degrees}
                  onChange={e => onUpdateField("degrees", Number(e.target.value))}
                  className="w-12 px-1.5 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-center font-mono"
                />
                <span className="text-[10px] text-gray-400">°</span>
              </div>
              <div className="flex flex-col items-center">
                <input
                  type="number" min={0} max={59} value={seg.minutes}
                  onChange={e => onUpdateField("minutes", Number(e.target.value))}
                  className="w-12 px-1.5 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-center font-mono"
                />
                <span className="text-[10px] text-gray-400">'</span>
              </div>
              <div className="flex flex-col items-center">
                <input
                  type="number" min={0} max={59} value={seg.seconds}
                  onChange={e => onUpdateField("seconds", Number(e.target.value))}
                  className="w-12 px-1.5 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-center font-mono"
                />
                <span className="text-[10px] text-gray-400">"</span>
              </div>
            </div>

            <select
              value={seg.to}
              onChange={e => onUpdateField("to", e.target.value as CardinalDirection)}
              className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono"
            >
              {CARDINAL_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Distância (m)</label>
          <input
            type="number" min={0} step={0.01} value={seg.distance}
            onChange={e => onUpdateField("distance", Number(e.target.value))}
            className={`${inputClass} font-mono`}
            placeholder="0.00"
          />
        </div>
      </div>
    )}
  </div>
)

export default SegmentItem
