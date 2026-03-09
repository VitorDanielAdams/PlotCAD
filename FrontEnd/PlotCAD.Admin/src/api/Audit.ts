import { IAuditLogListRequest, IAuditLogListResponse } from "../types/backoffice.types";
import { IResponse } from "../types/common.types";
import api, { ApiError } from "./Api";

const AuditApi = () => {
	const path = "/audit";

	const list = async (request: IAuditLogListRequest): Promise<IResponse<IAuditLogListResponse>> => {
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

	return { list };
};

export default AuditApi;
