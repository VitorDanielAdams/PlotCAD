import { useNavigate } from "react-router-dom"
import { Plus, Trash2, ChevronDown, ChevronUp, Maximize2, Save, X } from "lucide-react"
import { useLandDraw, CARDINAL_OPTIONS } from "./LandDraw.hooks"
import type { CardinalDirection } from "./LandDraw.types"

const LandDraw = () => {
  const navigate = useNavigate()
  const {
    segments,
    scale,
    setScale,
    openSegmentId,
    toggleSegment,
    fullscreen,
    setFullscreen,
    canvasRef,
    isClosed,
    areaM2,
    perimeter,
    addSegment,
    removeSegment,
    updateSegment,
    updateBearingRaw,
    formatBearing,
  } = useLandDraw()

  const handleSave = () => {
    // TODO: integrate with POST /matriculas endpoint when available
    alert("Salvar matrícula — endpoint a implementar")
  }

  const handleCancel = () => navigate("/v1/matriculas")

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">

      {/* ── Canvas ─────────────────────────────────────────────────────────── */}
      <div className={`flex flex-col flex-1 bg-[#0f172a] relative transition-all duration-300 ${fullscreen ? "w-full" : ""}`}>

        {/* status badges */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
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

        {/* fullscreen toggle */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => setFullscreen(f => !f)}
            className="p-1.5 text-white/50 hover:text-white bg-black/30 hover:bg-black/50 rounded transition-colors"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* zoom slider */}
        <div className="absolute bottom-8 right-4 z-10 flex flex-col items-center gap-1">
          <span className="text-xs text-white/40 font-mono mb-1">ZOOM</span>
          <input
            type="range"
            min={0.2}
            max={4}
            step={0.05}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
            className="appearance-none rounded bg-white/20 accent-green-500 cursor-pointer"
            style={{ writingMode: "vertical-lr", direction: "rtl", width: 6, height: 100 }}
          />
          <span className="text-xs text-white/40 font-mono">{scale.toFixed(1)}x</span>
        </div>

        {/* canvas — size is handled inside useLandDraw, no onMouseEnter needed */}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: "block" }}
        />
      </div>

      {/* ── Sidenav ────────────────────────────────────────────────────────── */}
      {!fullscreen && (
        <div className="w-[340px] min-w-[300px] bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl">

          {/* header */}
          <div className="bg-[#15803d] text-white px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Nova Matrícula</h2>
              <p className="text-xs text-white/70 mt-0.5">
                {segments.length} segmento{segments.length !== 1 ? "s" : ""}
                {areaM2 !== null ? ` · ${areaM2.toFixed(2)} m²` : ""}
              </p>
            </div>
            <button
              onClick={addSegment}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[#15803d] text-xs font-semibold rounded hover:bg-green-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              SEGMENTO
            </button>
          </div>

          {/* segment list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {segments.map((seg, index) => (
              <div key={seg.id} className="bg-white">

                {/* accordion header */}
                <button
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => toggleSegment(seg.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center bg-green-100 text-green-700 text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-mono font-semibold text-gray-800">
                        {formatBearing(seg)}
                      </p>
                      <p className="text-xs text-gray-400">{seg.distance.toFixed(2)} m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {segments.length > 1 && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => { e.stopPropagation(); removeSegment(seg.id) }}
                        onKeyDown={e => e.key === "Enter" && removeSegment(seg.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {openSegmentId === seg.id
                      ? <ChevronUp className="h-4 w-4 text-gray-400" />
                      : <ChevronDown className="h-4 w-4 text-gray-400" />
                    }
                  </div>
                </button>

                {/* segment form */}
                {openSegmentId === seg.id && (
                  <div className="px-4 pb-4 pt-1 bg-gray-50 border-t border-gray-100 space-y-3">

                    {/* quick bearing input */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Rumo rápido
                      </label>
                      <input
                        type="text"
                        value={seg.bearingRaw}
                        onChange={e => updateBearingRaw(seg.id, e.target.value)}
                        placeholder="ex: SO1235NE ou SO123545NE"
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono placeholder:text-gray-300"
                        maxLength={12}
                      />
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Digite o rumo completo — os campos abaixo são preenchidos automaticamente
                      </p>
                    </div>

                    {/* detailed bearing fields */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Rumo detalhado</label>
                      <div className="flex items-center gap-2">

                        <select
                          value={seg.from}
                          onChange={e => updateSegment(seg.id, "from", e.target.value as CardinalDirection)}
                          className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono"
                        >
                          {CARDINAL_OPTIONS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1 flex-1">
                          <div className="flex flex-col items-center">
                            <input
                              type="number"
                              min={0}
                              max={89}
                              value={seg.degrees}
                              onChange={e => updateSegment(seg.id, "degrees", Number(e.target.value))}
                              className="w-12 px-1.5 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-center font-mono"
                            />
                            <span className="text-[10px] text-gray-400">°</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <input
                              type="number"
                              min={0}
                              max={59}
                              value={seg.minutes}
                              onChange={e => updateSegment(seg.id, "minutes", Number(e.target.value))}
                              className="w-12 px-1.5 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-center font-mono"
                            />
                            <span className="text-[10px] text-gray-400">'</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <input
                              type="number"
                              min={0}
                              max={59}
                              value={seg.seconds}
                              onChange={e => updateSegment(seg.id, "seconds", Number(e.target.value))}
                              className="w-12 px-1.5 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-center font-mono"
                            />
                            <span className="text-[10px] text-gray-400">"</span>
                          </div>
                        </div>

                        <select
                          value={seg.to}
                          onChange={e => updateSegment(seg.id, "to", e.target.value as CardinalDirection)}
                          className="w-16 px-2 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono"
                        >
                          {CARDINAL_OPTIONS.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* distance */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Distância (m)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={seg.distance}
                        onChange={e => updateSegment(seg.id, "distance", Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent font-mono"
                        placeholder="0.00"
                      />
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Footer ─────────────────────────────────────────────────────── */}
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white rounded border border-gray-200 px-3 py-2">
                <p className="text-gray-400 mb-0.5">Segmentos</p>
                <p className="font-semibold text-gray-800 font-mono">{segments.length}</p>
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

            {/* action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#15803d] hover:bg-green-700 text-white text-xs font-semibold rounded transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar Matrícula
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 text-gray-600 text-xs font-semibold rounded border border-gray-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default LandDraw
