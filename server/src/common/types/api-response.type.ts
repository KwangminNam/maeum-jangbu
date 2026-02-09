export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  result: T | null;
  error: ApiError | null;
}

export function successResponse<T>(result: T): ApiResponse<T> {
  return { result, error: null };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<null> {
  return { result: null, error: { code, message, details } };
}
