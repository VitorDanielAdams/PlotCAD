import axios, {
	AxiosError,
	AxiosInstance,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const api: AxiosInstance = axios.create({
	baseURL: `${import.meta.env.VITE_API_URL}/api`,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json;charset=utf-8",
	},
});

api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const tenantId: string | undefined = import.meta.env.VITE_TENANT_ID;

		if (tenantId) {
			config.headers["X-Tenant-Key"] = tenantId;
		}

		return config;
	},
	(error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			Cookies.remove("token");
		}
		return Promise.reject(error);
	},
);

export default api;
