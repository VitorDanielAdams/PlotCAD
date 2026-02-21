import { post, getById } from "./Common";
import type { IResponse } from "../types/common.types";
import type {
  ILandListRequest,
  ILandListResponse,
  ILandDetail,
} from "../types/land.types";

export const listLands = async (
  request: ILandListRequest
): Promise<IResponse<ILandListResponse>> => {
  return post<ILandListRequest>("lands/list", request);
};

export const getLandById = async (id: number): Promise<IResponse<ILandDetail>> => {
  return getById<IResponse<ILandDetail>>("lands", String(id));
};
