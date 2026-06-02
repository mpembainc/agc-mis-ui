export interface DeleteResponse {
  isSuccess: boolean;
  message: string;
}

export interface ErrorResponse {
  status: string,
  message: string,
  cause: string
}

export interface DialogResult<T> {
  success: boolean;
  data: T;
}

export interface FetchResponse<T> {
  size: number;
  collection: T
}

export interface NameDto {
  name: string;
  reference: string;
}

export interface PaginationParams {
   page: number;
   pageSize: number;
   search: string;
}

export interface PaginatedResult<T> {
   items: T[];
   total: number;
}