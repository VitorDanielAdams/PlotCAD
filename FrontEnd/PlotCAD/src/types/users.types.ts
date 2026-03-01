export interface IUserResponse {
	id: number;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
}

export interface IUserListFilter {
	name?: string;
	email?: string;
	isActive?: boolean;
}

export interface IUserListRequest {
	pageNumber: number;
	pageSize: number;
	filter?: IUserListFilter;
}

export interface IUserListResponse {
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	items: IUserResponse[];
}

export interface ICreateUserRequest {
	name: string;
	email: string;
	password: string;
	role: string;
}

export interface IUpdateUserRequest {
	name: string;
	email: string;
	role: string;
}

export interface IPlanInfoResponse {
	maxUsers: number;
	currentUsers: number;
	canAddUsers: boolean;
}

export interface IChangePasswordRequest {
	newPassword: string;
}
