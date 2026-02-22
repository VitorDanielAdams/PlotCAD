import type { ISegment } from "../../LandDraw.types";
import SegmentItem from "./SegmentItem";

interface Props {
	segments: ISegment[];
	openSegmentId: string | null;
	toggleSegment: (id: string) => void;
	removeSegment: (id: string) => void;
	updateSegment: (id: string, field: keyof ISegment, value: string | number) => void;
	updateBearingRaw: (id: string, raw: string) => void;
	formatBearing: (seg: ISegment) => string;
}

const SegmentsTab = ({
	segments,
	openSegmentId,
	toggleSegment,
	removeSegment,
	updateSegment,
	updateBearingRaw,
	formatBearing,
}: Props) => (
	<div className="flex-1 overflow-y-auto divide-y divide-gray-100">
		{segments.map((seg, index) => (
			<SegmentItem
				key={seg.id}
				seg={seg}
				index={index}
				isOpen={openSegmentId === seg.id}
				showDelete={segments.length > 1}
				onToggle={() => toggleSegment(seg.id)}
				onRemove={() => removeSegment(seg.id)}
				onUpdateField={(field, value) => updateSegment(seg.id, field, value)}
				onUpdateBearingRaw={(raw) => updateBearingRaw(seg.id, raw)}
				formatBearing={formatBearing}
			/>
		))}
	</div>
);

export default SegmentsTab;
