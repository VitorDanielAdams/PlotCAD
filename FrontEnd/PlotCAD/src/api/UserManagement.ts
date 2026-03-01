import { IResponse } from "../types/common.types";
import {
	IChangePasswordRequest,
	ICreateUserRequest,
	IPlanInfoResponse,
	IUpdateUserRequest,
	IUserListRequest,
	IUserListResponse,
	IUserResponse,
} from "../types/users.types";
import api, { ApiError } from "./Api";

const UserManagementApi = () => {
	const path = "/users";

	const getPlanInfo = async (): Promise<IResponse<IPlanInfoResponse>> => {
		try {
			return await api.get(`${path}/plan-info`).then((v) => v.data);
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

	const listUsers = async (
		request: IUserListRequest,
	): Promise<IResponse<IUserListResponse>> => {
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

	const createUser = async (
		body: ICreateUserRequest,
	): Promise<IResponse<IUserResponse>> => {
		try {
			return await api.post(`${path}`, body).then((v) => v.data);
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

	const updateUser = async (
		id: number,
		body: IUpdateUserRequest,
	): Promise<IResponse<IUserResponse>> => {
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

	const deleteUser = async (id: number): Promise<IResponse<unknown>> => {
		try {
			return await api.delete(`${path}/${id}`).then((v) => v.data);
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

	const changePassword = async (
		id: number,
		body: IChangePasswordRequest,
	): Promise<IResponse<unknown>> => {
		try {
			return await api.patch(`${path}/${id}/change-password`, body).then((v) => v.data);
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

	return { getPlanInfo, listUsers, createUser, updateUser, toggleActive, deleteUser, changePassword };
};

export default UserManagementApi;
