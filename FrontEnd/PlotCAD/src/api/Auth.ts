import { ILoginRequest } from "../types/auth.types";
import { IResponse } from "../types/common.types";
import api, { ApiError } from "./Api";

const AuthApi = () => {
	const path = `/auth`;

	const login = async (body: ILoginRequest): Promise<IResponse<unknown>> => {
		try {
			return await api.post(`${path}/login`, body).then((value) => value.data);
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

	const logout = async (): Promise<IResponse<unknown>> => {
		try {
			return await api.post(`${path}/logout`).then((value) => value.data);
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

	return { login, logout };
};

export default AuthApi;
