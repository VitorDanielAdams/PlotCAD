import { IResponse } from "../types/common.types";
import {
	ICreateModuleRequest,
	IModule,
	ISetTenantModuleRequest,
	ITenantModule,
	IUpdateModuleRequest,
} from "../types/backoffice.types";
import api, { ApiError } from "./Api";

const ModuleApi = () => {
	const path = "/modules";

	const getAll = async (): Promise<IResponse<IModule[]>> => {
		try {
			return await api.get(path).then((v) => v.data);
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

	const getById = async (id: number): Promise<IResponse<IModule>> => {
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

	const create = async (body: ICreateModuleRequest): Promise<IResponse<IModule>> => {
		try {
			return await api.post(path, body).then((v) => v.data);
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

	const update = async (id: number, body: IUpdateModuleRequest): Promise<IResponse<unknown>> => {
		try {
			return await api.put(`${path}/${id}`, body).then((v) => v.data);
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

	const toggleActive = async (id: number): Promise<IResponse<unknown>> => {
		try {
			return await api.patch(`${path}/${id}/toggle-active`).then((v) => v.data);
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

	const getTenantModules = async (tenantId: string): Promise<IResponse<ITenantModule[]>> => {
		try {
			return await api.get(`${path}/tenant/${tenantId}`).then((v) => v.data);
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

	const setTenantModule = async (
		tenantId: string,
		body: ISetTenantModuleRequest,
	): Promise<IResponse<unknown>> => {
		try {
			return await api.post(`${path}/tenant/${tenantId}`, body).then((v) => v.data);
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

	return { getAll, getById, create, update, toggleActive, getTenantModules, setTenantModule };
};

export default ModuleApi;
