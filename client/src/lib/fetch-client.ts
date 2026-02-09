import type { ApiResponse, ApiError } from "./types";

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response, data: unknown) => unknown | Promise<unknown>;
type ErrorInterceptor = (error: FetchError) => unknown | Promise<unknown>;

interface RequestConfig extends RequestInit {
  url: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export class FetchError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown,
    public response: Response
  ) {
    super(`HTTP Error ${status}: ${statusText}`);
    this.name = "FetchError";
  }
}

export class ApiException extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiException";
  }

  static fromApiError(error: ApiError): ApiException {
    return new ApiException(error.code, error.message, error.details);
  }
}

class FetchClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL: string = "", defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  // ── Interceptors ──
  interceptors = {
    request: {
      use: (interceptor: RequestInterceptor) => {
        this.requestInterceptors.push(interceptor);
        return () => {
          const index = this.requestInterceptors.indexOf(interceptor);
          if (index > -1) this.requestInterceptors.splice(index, 1);
        };
      },
      clear: () => {
        this.requestInterceptors = [];
      },
    },
    response: {
      use: (onSuccess: ResponseInterceptor, onError?: ErrorInterceptor) => {
        this.responseInterceptors.push(onSuccess);
        if (onError) this.errorInterceptors.push(onError);
        return () => {
          const successIndex = this.responseInterceptors.indexOf(onSuccess);
          if (successIndex > -1) this.responseInterceptors.splice(successIndex, 1);
          if (onError) {
            const errorIndex = this.errorInterceptors.indexOf(onError);
            if (errorIndex > -1) this.errorInterceptors.splice(errorIndex, 1);
          }
        };
      },
      clear: () => {
        this.responseInterceptors = [];
        this.errorInterceptors = [];
      },
    },
  };

  // ── Set Auth Token ──
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders["Authorization"];
    }
  }

  // ── Set Header ──
  setHeader(key: string, value: string | null) {
    if (value) {
      this.defaultHeaders[key] = value;
    } else {
      delete this.defaultHeaders[key];
    }
  }

  // ── Build URL with params ──
  private buildURL(url: string, params?: Record<string, string | number | boolean | undefined>): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    if (!params) return fullURL;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullURL}?${queryString}` : fullURL;
  }

  // ── Core Request ──
  async request<T>(config: RequestConfig): Promise<T> {
    // Apply request interceptors
    let processedConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    const { url, params, ...init } = processedConfig;
    const fullURL = this.buildURL(url, params);

    const response = await fetch(fullURL, {
      ...init,
      headers: {
        ...this.defaultHeaders,
        ...(init.headers as Record<string, string>),
      },
    });

    let data: unknown;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // 표준 API 응답 처리 (result/error 형식)
    const apiResponse = data as ApiResponse<T>;

    if (apiResponse.error) {
      const apiError = ApiException.fromApiError(apiResponse.error);

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        try {
          const fallback = await interceptor(
            new FetchError(response.status, response.statusText, data, response)
          );
          if (fallback !== undefined) return fallback as T;
        } catch (e) {
          throw e;
        }
      }

      throw apiError;
    }

    if (!response.ok) {
      const error = new FetchError(response.status, response.statusText, data, response);

      for (const interceptor of this.errorInterceptors) {
        try {
          const result = await interceptor(error);
          if (result !== undefined) return result as T;
        } catch (e) {
          throw e;
        }
      }

      throw error;
    }

    // Apply response interceptors
    let result = apiResponse.result as unknown;
    for (const interceptor of this.responseInterceptors) {
      result = await interceptor(response, result);
    }

    return result as T;
  }

  // ── HTTP Methods ──
  async get<T>(url: string, params?: Record<string, string | number | boolean | undefined>, config?: Omit<RequestConfig, "url" | "method" | "params">): Promise<T> {
    return this.request<T>({ ...config, url, params, method: "GET" });
  }

  async post<T>(url: string, data?: unknown, config?: Omit<RequestConfig, "url" | "method" | "body">): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: unknown, config?: Omit<RequestConfig, "url" | "method" | "body">): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(url: string, data?: unknown, config?: Omit<RequestConfig, "url" | "method" | "body">): Promise<T> {
    return this.request<T>({
      ...config,
      url,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string, config?: Omit<RequestConfig, "url" | "method">): Promise<T> {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

// ── Create Instance ──
export function createFetchClient(baseURL: string = "", defaultHeaders: Record<string, string> = {}) {
  return new FetchClient(baseURL, defaultHeaders);
}

// ── Default Client ──
export const client = createFetchClient(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);

export default client;
