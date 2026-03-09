import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
		this.name = "ApiError";
	}
}

const api: AxiosInstance = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api/backoffice`,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json;charset=utf-8",
	},
});

api.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError) => {
		const status = error.response?.status;
		const data = error.response?.data as Record<string, unknown> | undefined;
		const message = (data?.message as string) ?? error.message;

		if (status === 401) {
			Cookies.remove("BackofficeToken");
			window.dispatchEvent(new Event("auth:unauthorized"));
		}

		return Promise.reject(new ApiError(status ?? 0, message));
	},
);

export default api;
