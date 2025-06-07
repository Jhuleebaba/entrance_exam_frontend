import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

export const retryApiCall = async <T = any>(
  requestFn: () => Promise<AxiosResponse<T>>,
  config: RetryConfig = {}
): Promise<AxiosResponse<T>> => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error) => {
      // Retry on network errors or 5xx server errors
      return !error.response || (error.response.status >= 500 && error.response.status < 600);
    }
  } = config;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      if (attempt > 0) {
        console.log(`✅ API call succeeded on attempt ${attempt + 1}`);
      }
      return response;
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries || !retryCondition(error)) {
        break;
      }

      const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
      console.warn(`⚠️ API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error.message);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

// Helper function for creating axios requests with retry
export const createRetryAxios = (baseConfig: AxiosRequestConfig = {}) => {
  return {
    get: <T = any>(url: string, config?: AxiosRequestConfig) =>
      retryApiCall(() => axios.get<T>(url, { ...baseConfig, ...config })),
    
    post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      retryApiCall(() => axios.post<T>(url, data, { ...baseConfig, ...config })),
    
    put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
      retryApiCall(() => axios.put<T>(url, data, { ...baseConfig, ...config })),
    
    delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
      retryApiCall(() => axios.delete<T>(url, { ...baseConfig, ...config })),
  };
}; 