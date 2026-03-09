import { IPagedRequest, IPagedResponse } from "./auth.types";

export type PlanType = "Individual" | "Company";
export type TSubscriptionStatus = "Trial" | "Active" | "Expired" | "Suspended";

export interface ITenant {
	id: string;
	name: string;
	planType: PlanType;
	maxUsers: number;
	subscriptionStatus: TSubscriptionStatus;
	subscriptionExpiresAt: string | null;
	stripeCustomerId: string | null;
	userCount: number;
	createdAt: string;
	updatedAt: string | null;
}

export interface ITenantListRequest extends IPagedRequest {
	search?: string;
	status?: TSubscriptionStatus;
}

export type ITenantListResponse = IPagedResponse<ITenant>;

export interface IUpdateTenantSubscriptionRequest {
	subscriptionStatus?: TSubscriptionStatus;
	subscriptionExpiresAt?: string;
	planType?: PlanType;
	maxUsers?: number;
}
