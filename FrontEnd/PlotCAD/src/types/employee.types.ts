export interface IEmployee {
	id: number;
	name: string;
	phone: string | null;
	email: string | null;
	position: string | null;
	isActive: boolean;
	userId: number | null;
}

export interface IEmployeeListFilter {
	name?: string;
	isActive?: boolean;
}

export interface IEmployeeListRequest {
	pageNumber: number;
	pageSize: number;
	filter?: IEmployeeListFilter;
}

export interface IEmployeeListResponse {
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	items: IEmployee[];
}

export interface ICreateEmployeeRequest {
	name: string;
	phone?: string;
	email?: string;
	position?: string;
}

export interface IUpdateEmployeeRequest {
	name: string;
	phone?: string;
	email?: string;
	position?: string;
}
