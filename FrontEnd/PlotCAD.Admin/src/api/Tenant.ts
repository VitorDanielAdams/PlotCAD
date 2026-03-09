import { IResponse } from "../types/common.types";
import {
	ITenant,
	ITenantListRequest,
	ITenantListResponse,
	IUpdateTenantSubscriptionRequest,
} from "../types/tenant.types";
import api, { ApiError } from "./Api";

const TenantApi = () => {
	const path = "/tenants";

	const listTenants = async (request: ITenantListRequest): Promise<IResponse<ITenantListResponse>> => {
		try {
			return await api.post(`${path}/list`, request).then((v) => v.data);
		} catch (error) {
			const apiError = error as ApiError;
			return {
				success: false,
				message: apiError.message,
				data: null,
				errors: [],
				httpStatus: apiError.status,
			};
		}
	};

	const getTenant = async (id: string): Promise<IResponse<ITenant>> => {
		try {
			return await api.get(`${path}/${id}`).then((v) => v.data);
		} catch (error) {
			const apiError = error as ApiError;
			return {
				success: false,
				message: apiError.message,
				data: null,
				errors: [],
				httpStatus: apiError.status,
			};
		}
	};

	const updateSubscription = async (
		id: string,
		body: IUpdateTenantSubscriptionRequest,
	): Promise<IResponse<unknown>> => {
		try {
			return await api.put(`${path}/${id}/subscription`, body).then((v) => v.data);
		} catch (error) {
			const apiError = error as ApiError;
			return {
				success: false,
				message: apiError.message,
				data: null,
				errors: [],
				httpStatus: apiError.status,
			};
		}
	};

	return { listTenants, getTenant, updateSubscription };
};

export default TenantApi;
