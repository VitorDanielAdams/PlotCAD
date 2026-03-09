import { IPagedRequest, IPagedResponse } from "./auth.types";

export interface IUser {
	id: number;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
	tenantId: string;
	tenantName: string;
	createdAt: string;
}

export interface IUserListRequest extends IPagedRequest {
	search?: string;
	tenantId?: string;
	role?: string;
	isActive?: boolean;
}

export type IUserListResponse = IPagedResponse<IUser>;

export interface IUpdateUserRoleRequest {
	role: "Admin" | "Manager" | "Employee";
}
