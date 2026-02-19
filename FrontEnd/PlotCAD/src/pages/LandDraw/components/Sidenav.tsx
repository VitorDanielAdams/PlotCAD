import { useState } from "react"
import SidenavHeader from "./SidenavHeader"
import TabBar from "./TabBar"
import SegmentsTab from "./SegmentsTab"
import RegistrationTab from "./RegistrationTab"
import SidenavFooter from "./SidenavFooter"
import type { ISegment, IRegistration } from "../LandDraw.types"

type ActiveTab = "segments" | "registration"

interface Props {
  segments: ISegment[]
  openSegmentId: string | null
  toggleSegment: (id: string) => void
  registration: IRegistration
  updateRegistration: (field: keyof IRegistration, value: string) => void
  isClosed: boolean
  areaM2: number | null
  perimeter: number
  addSegment: () => void
  removeSegment: (id: string) => void
  updateSegment: (id: string, field: keyof ISegment, value: string | number) => void
  updateBearingRaw: (id: string, raw: string) => void
  formatBearing: (seg: ISegment) => string
  onSave: () => void
  onCancel: () => void
}

const Sidenav = ({
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
  onCancel,
}: Props) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("segments")

  return (
    <div className="w-[340px] min-w-[300px] bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl">
      <SidenavHeader
        segmentCount={segments.length}
        areaM2={areaM2}
        activeTab={activeTab}
        onAddSegment={addSegment}
      />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === "segments" && (
        <SegmentsTab
          segments={segments}
          openSegmentId={openSegmentId}
          toggleSegment={toggleSegment}
          removeSegment={removeSegment}
          updateSegment={updateSegment}
          updateBearingRaw={updateBearingRaw}
          formatBearing={formatBearing}
        />
      )}
      {activeTab === "registration" && (
        <RegistrationTab registration={registration} updateRegistration={updateRegistration} />
      )}
      <SidenavFooter
        segmentCount={segments.length}
        isClosed={isClosed}
        areaM2={areaM2}
        perimeter={perimeter}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  )
}

export default Sidenav
