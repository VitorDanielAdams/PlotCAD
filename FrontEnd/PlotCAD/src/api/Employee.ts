import { IResponse } from "../types/common.types";
import {
	ICreateEmployeeRequest,
	IEmployee,
	IEmployeeListRequest,
	IEmployeeListResponse,
	IUpdateEmployeeRequest,
} from "../types/employee.types";
import api, { ApiError } from "./Api";

const EmployeeApi = () => {
	const path = "/employees";

	const listEmployees = async (
		request: IEmployeeListRequest,
	): Promise<IResponse<IEmployeeListResponse>> => {
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

	const createEmployee = async (
		body: ICreateEmployeeRequest,
	): Promise<IResponse<IEmployee>> => {
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

	const updateEmployee = async (
		id: number,
		body: IUpdateEmployeeRequest,
	): Promise<IResponse<IEmployee>> => {
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

	const deleteEmployee = async (id: number): Promise<IResponse<unknown>> => {
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

	const toggleEmployee = async (id: number): Promise<IResponse<unknown>> => {
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

	const duplicateEmployee = async (id: number): Promise<IResponse<IEmployee>> => {
		try {
			return await api.post(`${path}/${id}/duplicate`).then((v) => v.data);
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
		listEmployees,
		createEmployee,
		updateEmployee,
		deleteEmployee,
		toggleEmployee,
		duplicateEmployee,
	};
};

export default EmployeeApi;
