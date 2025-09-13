/**
 * Shared Error Handling Utilities
 * Common error handling patterns used across the application
 */

/**
 * Standardized error response structure
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

/**
 * Common error handling for API calls with consistent error messages
 */
export const handleApiError = (error: unknown, context: string = 'API call'): ApiErrorResponse => {
  const timestamp = new Date();

  // Handle different error types
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'JS_ERROR',
      details: error.stack,
      timestamp
    };
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR',
      timestamp
    };
  }

  // Handle fetch/network errors
  if (error && typeof error === 'object') {
    const err = error as any;

    if (err.status || err.statusText) {
      return {
        message: `${context} failed: ${err.statusText || 'Network error'}`,
        code: `HTTP_${err.status || 'UNKNOWN'}`,
        details: err,
        timestamp
      };
    }

    if (err.message) {
      return {
        message: err.message,
        code: 'OBJECT_ERROR',
        details: err,
        timestamp
      };
    }
  }

  // Fallback for unknown error types
  return {
    message: `Unknown error in ${context}`,
    code: 'UNKNOWN_ERROR',
    details: error,
    timestamp
  };
};

/**
 * Retry logic with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context: string = 'operation'
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw handleApiError(error, `${context} (final attempt)`);
      }

      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));

      if (process.env.NODE_ENV === 'development') {
        console.warn(`${context} attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
  }

  throw handleApiError(lastError, context);
};

/**
 * Safe async operation wrapper with error handling
 */
export const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  context: string = 'operation'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const errorResponse = handleApiError(error, context);

    if (process.env.NODE_ENV === 'development') {
      console.error(`Safe operation failed (${context}):`, errorResponse);
    }

    return fallbackValue;
  }
};

/**
 * Development-only error logging
 */
export const logError = (error: unknown, context: string, additionalInfo?: any): void => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const errorResponse = handleApiError(error, context);
  console.error(`[${context}] Error:`, errorResponse, additionalInfo && { additionalInfo });
};

/**
 * Production-safe error message extraction
 */
export const getErrorMessage = (error: unknown, fallback: string = 'An unexpected error occurred'): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const err = error as any;
    return err.message || err.statusText || fallback;
  }

  return fallback;
};