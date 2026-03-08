import type { IResponse } from "../types/common.types";
import type {
	ICreateLandRequest,
	ILandDetail,
	ILandListRequest,
	ILandListResponse,
	IUpdateLandRequest,
} from "../types/land.types";
import api from "./Api";
import { getById, post, remove, update } from "./Common";

const path = "lands";

export const createLand = async (
	body: ICreateLandRequest,
): Promise<IResponse<unknown>> => {
	try {
		return (await post<ICreateLandRequest>(`${path}/save`, body)).data;
	} catch (e: any) {
		if (e?.response?.data?.message) {
			return Promise.reject(e.response.data.error);
		}
		return Promise.reject(e.message);
	}
};

export const updateLand = async (
	id: number,
	body: IUpdateLandRequest,
): Promise<IResponse<unknown>> => {
	try {
		return await update<IUpdateLandRequest, IResponse<unknown>>(path, body, String(id));
	} catch (e: any) {
		if (e?.response?.data?.message) {
			return Promise.reject(e.response.data.error);
		}
		return Promise.reject(e.message);
	}
};

export const disableLand = async (id: number): Promise<IResponse<unknown>> => {
	try {
		return await remove(path, String(id));
	} catch (e: any) {
		if (e?.response?.data?.message) {
			return Promise.reject(e.response.data.error);
		}
		return Promise.reject(e.message);
	}
};

export const toggleLand = async (id: number): Promise<IResponse<unknown>> => {
	try {
		return (await api.patch(`${path}/${id}/toggle-active`)).data;
	} catch (e: any) {
		if (e?.response?.data?.message) {
			return Promise.reject(e.response.data.error);
		}
		return Promise.reject(e.message);
	}
};

export const duplicateLand = async (id: number): Promise<IResponse<unknown>> => {
	try {
		return (await api.post(`${path}/${id}/duplicate`)).data;
	} catch (e: any) {
		if (e?.response?.data?.message) {
			return Promise.reject(e.response.data.error);
		}
		return Promise.reject(e.message);
	}
};

export const listLands = async (
	request: ILandListRequest,
): Promise<IResponse<ILandListResponse>> => {
	return post<ILandListRequest>(`${path}/list`, request);
};

export const getLandById = async (id: number): Promise<IResponse<ILandDetail>> => {
	return getById<IResponse<ILandDetail>>(path, String(id));
};
