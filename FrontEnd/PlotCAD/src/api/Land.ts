import { post } from "./Common";
import type { IResponse } from "../types/common.types";

export interface ILandListFilter {
  name?: string;
  registrationNumber?: number;
  isActive?: boolean;
}

export interface ILandListRequest {
  pageNumber: number;
  pageSize: number;
  filter?: ILandListFilter;
}

export interface ILandListItem {
  id: number;
  name: string;
  registrationNumber: number;
  location: string;
  totalArea: number;
  isActive: boolean;
}

export interface ILandListResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  items: ILandListItem[];
}

export const listLands = async (
  request: ILandListRequest
): Promise<IResponse<ILandListResponse>> => {
  return post<ILandListRequest>("lands/list", request);
};
