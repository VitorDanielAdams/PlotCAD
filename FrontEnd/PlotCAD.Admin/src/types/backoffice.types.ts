import { IPagedRequest, IPagedResponse } from "./auth.types";

export interface IModule {
	id: number;
	code: string;
	name: string;
	description: string | null;
	isActive: boolean;
	createdAt: string;
}

export interface ICreateModuleRequest {
	code: string;
	name: string;
	description?: string;
}

export interface IUpdateModuleRequest {
	name: string;
	description?: string;
}

export interface ITenantModule {
	moduleId: number;
	moduleCode: string;
	moduleName: string;
	isEnabled: boolean;
	enabledAt: string | null;
}

export interface ISetTenantModuleRequest {
	moduleId: number;
	isEnabled: boolean;
}

export interface IAuditLog {
	id: number;
	managerId: number | null;
	managerName: string | null;
	action: string;
	entityType: string;
	entityId: string;
	details: string | null;
	ipAddress: string | null;
	createdAt: string;
}

export interface IAuditLogListRequest extends IPagedRequest {
	managerId?: number;
	entityType?: string;
	action?: string;
	fromDate?: string;
	toDate?: string;
}

export type IAuditLogListResponse = IPagedResponse<IAuditLog>;

export interface IDashboardStats {
	totalTenants: number;
	activeTenants: number;
	totalUsers: number;
	activeUsers: number;
	totalModules: number;
	trialTenants: number;
	expiredTenants: number;
	suspendedTenants: number;
}
