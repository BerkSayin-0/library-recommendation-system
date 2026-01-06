/**
 * Error handling utilities with react-hot-toast integration
 */
import toast from 'react-hot-toast';

/**
 * Handles API errors and displays modern toast notifications
 */
export function handleApiError(error: unknown): void {
  let message = 'An unexpected error occurred';

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  toast.error(message, {
    duration: 4000,
    position: 'top-right',
  });

  console.error('API Error:', error);
}

/**
 * Shows a modern success toast to the user
 */
export function showSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
  });

  console.log('Success:', message);
}
