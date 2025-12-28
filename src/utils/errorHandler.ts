import { toast } from 'react-toastify';

type ErrorTypeValue = 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'UNKNOWN';

export const ErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

interface ApiErrorOptions {
  type: ErrorTypeValue;
  statusCode?: number;
  message?: string;
}

export class ApiError extends Error {
  type: ErrorTypeValue;
  statusCode: number | undefined;

  constructor(options: ApiErrorOptions) {
    super(options.message || getErrorMessage(options.type));
    this.name = 'ApiError';
    this.type = options.type;
    this.statusCode = options.statusCode;
  }
}

export function getErrorMessage(type: ErrorTypeValue): string {
  const messages: Record<ErrorTypeValue, string> = {
    NETWORK_ERROR: 'Lỗi kết nối. Vui lòng kiểm tra mạng của bạn.',
    VALIDATION_ERROR: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
    NOT_FOUND: 'Tài nguyên không tìm thấy.',
    UNAUTHORIZED: 'Bạn không có quyền truy cập.',
    SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
    UNKNOWN: 'Đã xảy ra lỗi. Vui lòng thử lại.',
  };

  return messages[type] || messages.UNKNOWN;
}

export function handleError(error: unknown, showToast = true): ApiError {
  let apiError: ApiError;

  // Type guard for axios error
  const isAxiosError = (err: unknown): err is { response?: { status: number; data?: { message?: string } }; request?: unknown; message?: string } => {
    return typeof err === 'object' && err !== null && ('response' in err || 'request' in err || 'message' in err);
  };

  if (isAxiosError(error) && error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        apiError = new ApiError({
          type: ErrorType.VALIDATION_ERROR,
          statusCode: status,
          message: data?.message || 'Dữ liệu không hợp lệ'
        });
        break;
      case 401:
        apiError = new ApiError({
          type: ErrorType.UNAUTHORIZED,
          statusCode: status,
          message: 'Vui lòng đăng nhập lại'
        });
        break;
      case 404:
        apiError = new ApiError({
          type: ErrorType.NOT_FOUND,
          statusCode: status,
          message: 'Tài nguyên không tìm thấy'
        });
        break;
      case 500:
      case 502:
      case 503:
        apiError = new ApiError({
          type: ErrorType.SERVER_ERROR,
          statusCode: status,
          message: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.'
        });
        break;
      default:
        apiError = new ApiError({
          type: ErrorType.UNKNOWN,
          statusCode: status,
          message: data?.message || 'Đã xảy ra lỗi'
        });
    }
  } else if (isAxiosError(error) && error.request) {
    // Request made but no response
    apiError = new ApiError({
      type: ErrorType.NETWORK_ERROR,
      message: 'Không thể kết nối tới máy chủ'
    });
  } else if (isAxiosError(error) && error.message) {
    // Error in request setup
    apiError = new ApiError({
      type: ErrorType.UNKNOWN,
      message: error.message
    });
  } else {
    // Fallback for unknown error types
    apiError = new ApiError({
      type: ErrorType.UNKNOWN,
      message: error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định'
    });
  }

  if (showToast) {
    toast.error(apiError.message);
  }

  console.error('[API Error]', apiError);
  return apiError;
}

export default {
  ErrorType,
  ApiError,
  getErrorMessage,
  handleError,
};
