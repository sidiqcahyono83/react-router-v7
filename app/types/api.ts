export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export interface ApiPaginationResponse<T> {
  success: boolean;

  message: string;

  data: T[];

  meta: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
}

export interface ApiErrorResponse {
  success: false;

  message: string;

  errors?: Record<string, string[]>;
}
