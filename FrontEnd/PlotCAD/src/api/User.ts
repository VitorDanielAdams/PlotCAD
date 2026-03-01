import { IResponse } from "../types/common.types";
import { IUserResponse } from "../types/users.types";
import api, { ApiError } from "./Api";

const UserApi = () => {
	const path = "/users";

	const getCurrentUser = async (): Promise<IResponse<IUserResponse>> => {
		try {
			return await api.get(`${path}/me`).then((value) => value.data);
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

	return {
		getCurrentUser,
	};
};

export default UserApi;
