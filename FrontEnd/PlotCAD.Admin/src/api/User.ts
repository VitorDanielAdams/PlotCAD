import { IResponse } from "../types/common.types";
import {
	IUpdateUserRoleRequest,
	IUser,
	IUserListRequest,
	IUserListResponse,
} from "../types/user.types";
import api, { ApiError } from "./Api";

const UserApi = () => {
	const path = "/users";

	const listUsers = async (request: IUserListRequest): Promise<IResponse<IUserListResponse>> => {
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

	const getUser = async (id: number): Promise<IResponse<IUser>> => {
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

	const updateRole = async (id: number, body: IUpdateUserRoleRequest): Promise<IResponse<unknown>> => {
		try {
			return await api.put(`${path}/${id}/role`, body).then((v) => v.data);
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

	return { listUsers, getUser, toggleActive, updateRole };
};

export default UserApi;
