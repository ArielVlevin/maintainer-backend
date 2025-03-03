import { id } from "./MongoDB";
import { TaskStatus } from "../models/Task";
import { ProductStatus } from "../models/Product";

export type QueryParams = {
  user_id?: string | id;
  userOnly?: boolean;
  product_id?: string | id;
  page?: number;
  limit?: number;
  search?: string;
};

export type ProductQueryParams = QueryParams & {
  slug?: string;
  status?: ProductStatus;
  category?: string;
  fields?: string;
};

export type TaskQueryParams = QueryParams & {
  task_id?: string | id;
  status?: TaskStatus;
};
