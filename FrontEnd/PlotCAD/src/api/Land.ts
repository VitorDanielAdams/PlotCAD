import type { IResponse } from "../types/common.types";
import type {
	ILandDetail,
	ILandListRequest,
	ILandListResponse,
} from "../types/land.types";
import { getById, post } from "./Common";

const path = "lands";

export const createLand = async (body: FormData): Promise<IResponse<unknown>> => {
	try {
		return (await post<FormData>(`${path}/save`, body)).data;
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
