import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLandDraw } from "./LandDraw.hooks"
import CanvasOverlay from "./components/CanvasOverlay"
import LandDrawSidenav from "./components/LandDrawSidenav"
import KmlExportModal from "../../components/KmlExportModal"

const LandDraw = () => {
  const navigate = useNavigate()
  const [showKmlExport, setShowKmlExport] = useState(false)

  const {
    segments,
    openSegmentId,
    toggleSegment,
    registration,
    updateRegistration,
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
  } = useLandDraw()

  const handleSave = () => {
    alert("Salvar matrícula — endpoint a implementar")
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
  )
}

export default LandDraw
