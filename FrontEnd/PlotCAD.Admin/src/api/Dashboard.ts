import { IDashboardStats } from "../types/backoffice.types";
import { IResponse } from "../types/common.types";
import api, { ApiError } from "./Api";

const DashboardApi = () => {
	const path = "/dashboard";

	const getStats = async (): Promise<IResponse<IDashboardStats>> => {
		try {
			return await api.get(`${path}/stats`).then((v) => v.data);
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

	return { getStats };
};

export default DashboardApi;
