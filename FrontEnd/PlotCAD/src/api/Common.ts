import api from "./Api";

export const handleErrors = (error: any) => {
	if (error?.response?.data?.message) {
		return Promise.reject(error.response.data.error);
	}
	return Promise.reject(error.message);
};

export const post = async <T>(route: string, body: T) => {
	try {
		return (await api.post(`${route}`, body)).data;
	} catch (e: any) {
		return handleErrors(e);
	}
};

export const list = async <U>(route: string): Promise<U> => {
	try {
		return (await api.get(`${route}/list`)).data;
	} catch (e: any) {
		return handleErrors(e);
	}
};

export const getById = async <U>(route: string, id: string): Promise<U> => {
	try {
		return (await api.get(`${route}/${id}`)).data;
	} catch (e: any) {
		return handleErrors(e);
	}
};

export const update = async <T, U>(route: string, body: T, id: string): Promise<U> => {
	try {
		return (await api.put(`${route}/${id}`, body)).data;
	} catch (e: any) {
		return handleErrors(e);
	}
};

export const remove = async (route: string, id: string) => {
	try {
		return (await api.delete(`${route}/${id}`)).data;
	} catch (e: any) {
		return handleErrors(e);
	}
};