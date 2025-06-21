export interface ICommon {
  id: number;
  url: string | null;
  createdAt: string | null;
}

export interface IPage {
  limit?: number;
  offset?: number;
  type?: number;
}

export interface IPaginatedResponse<T> {
  total: number;
  totalPages: number;
  items: T[];
}

export interface IError {
  message?: string;
} 