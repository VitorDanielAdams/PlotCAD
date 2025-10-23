import axios from "axios";
import useAuth from "../contexts/hooks/useAuth";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json;charset=utf-8",
	},
});

api.interceptors.request.use(
  (config) => {
    const tenantId = import.meta.env.VITE_TENANT_ID;

    if (tenantId) {
      config.headers["X-Tenant-Key"] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
		const { logout } = useAuth();
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;