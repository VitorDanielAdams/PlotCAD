import { ILoginRequest } from "../types/auth.types";
import { IResponse } from "../types/common.types";
import api from "./Api";

const AuthApi = () => {
	const path = `/auth`;

	const login = async (body: ILoginRequest): Promise<IResponse<unknown>> => {
		try {
			return await api.post(`${path}/login`, body).then((value) => {
				console.log("User successfully logged in");
				return value.data;
			});
		} catch (error: any) {
			if (error?.response?.data?.message) {
				return Promise.reject(error.response.data.error);
			}
			return Promise.reject(error.message);
		}
	};

	return { login };
};

export default AuthApi;