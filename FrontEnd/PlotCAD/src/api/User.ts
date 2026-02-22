import { IResponse } from "../types/common.types";
import { IUserResponse } from "../types/users.types";
import api from "./Api";

const UserApi = () => {
	const path = "/users";

	const getCurrentUser = async (): Promise<IResponse<IUserResponse>> => {
		try {
			return (await api.get(`${path}/me`)).data;
		} catch (error: any) {
			if (error?.response?.data?.message) {
				return Promise.reject(error.response.data.error);
			}
			return Promise.reject(error.message);
		}
	};

	return {
		getCurrentUser,
	};
};

export default UserApi;
