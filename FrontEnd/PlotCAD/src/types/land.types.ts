export type CardinalDirection = "N" | "S" | "E" | "O" | "NE" | "NO" | "SE" | "SO";

export interface ILandListFilter {
	name?: string;
	registrationNumber?: number;
	isActive?: boolean;
}

export interface ILandListRequest {
	pageNumber: number;
	pageSize: number;
	filter?: ILandListFilter;
}

export interface ILandListItem {
	id: number;
	name: string;
	registrationNumber: number;
	location: string;
	totalArea: number;
	isActive: boolean;
}

export interface ILandListResponse {
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	items: ILandListItem[];
}

// ── API: detail ───────────────────────────────────────────────────────────────

export interface ILandSegmentDetail {
	id: number;
	sortOrder: number;
	fromDirection: string;
	toDirection: string;
	degrees: number;
	minutes: number;
	seconds: number;
	distance: number;
	label: string;
	bearingRaw: string;
}

export interface ILandDetail {
	id: number;
	name: string;
	registrationNumber: string;
	location: string;
	client: string;
	notes: string | null;
	totalArea: number;
	perimeter: number;
	isClosed: boolean;
	isActive: boolean;
	segments: ILandSegmentDetail[];
}

export interface IKmlSegment {
	from: CardinalDirection;
	to: CardinalDirection;
	degrees: number;
	minutes: number;
	seconds: number;
	distance: number;
}
