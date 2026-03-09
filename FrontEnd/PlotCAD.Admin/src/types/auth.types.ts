export interface IPagedResponse<T> {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
}

export interface IPagedRequest {
	page: number;
	pageSize: number;
}

export interface IManager {
	id: number;
	name: string;
	email: string;
}

export interface ILoginRequest {
	email: string;
	password: string;
}

export interface ILoginResponse {
	token: string;
	manager: IManager;
}
