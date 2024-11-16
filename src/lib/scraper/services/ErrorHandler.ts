import { notifications } from '../../../utils/notifications';

interface ErrorDetails {
  code: string;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private errors: ErrorDetails[] = [];
  private maxErrors: number = 100;

  handleError(error: Error, context?: Record<string, any>): void {
    const errorDetails: ErrorDetails = {
      code: this.getErrorCode(error),
      message: error.message,
      timestamp: new Date(),
      context
    };

    this.logError(errorDetails);
    this.notifyError(errorDetails);
    this.cleanup();
  }

  private getErrorCode(error: Error): string {
    if (error instanceof TypeError) return 'TYPE_ERROR';
    if (error instanceof ReferenceError) return 'REFERENCE_ERROR';
    if (error instanceof SyntaxError) return 'SYNTAX_ERROR';
    if (error.name === 'NetworkError') return 'NETWORK_ERROR';
    if (error.name === 'TimeoutError') return 'TIMEOUT_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private logError(error: ErrorDetails): void {
    this.errors.push(error);
    console.error('Scraper Error:', {
      code: error.code,
      message: error.message,
      context: error.context
    });
  }

  private notifyError(error: ErrorDetails): void {
    const message = this.formatErrorMessage(error);
    notifications.show(message, 'error');
  }

  private formatErrorMessage(error: ErrorDetails): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Failed to connect to the server. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please try again.';
      case 'TYPE_ERROR':
        return 'Invalid data format received.';
      default:
        return `An error occurred: ${error.message}`;
    }
  }

  private cleanup(): void {
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errors.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1;
    });
    return stats;
  }

  clearErrors(): void {
    this.errors = [];
  }
}import { notifications } from '../../../utils/notifications';

interface ErrorDetails {
  code: string;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export class ErrorHandler {
  private errors: ErrorDetails[] = [];
  private maxErrors: number = 100;

  handleError(error: Error, context?: Record<string, any>): void {
    const errorDetails: ErrorDetails = {
      code: this.getErrorCode(error),
      message: error.message,
      timestamp: new Date(),
      context
    };

    this.logError(errorDetails);
    this.notifyError(errorDetails);
    this.cleanup();
  }

  private getErrorCode(error: Error): string {
    if (error instanceof TypeError) return 'TYPE_ERROR';
    if (error instanceof ReferenceError) return 'REFERENCE_ERROR';
    if (error instanceof SyntaxError) return 'SYNTAX_ERROR';
    if (error.name === 'NetworkError') return 'NETWORK_ERROR';
    if (error.name === 'TimeoutError') return 'TIMEOUT_ERROR';
    return 'UNKNOWN_ERROR';
  }

  private logError(error: ErrorDetails): void {
    this.errors.push(error);
    console.error('Scraper Error:', {
      code: error.code,
      message: error.message,
      context: error.context
    });
  }

  private notifyError(error: ErrorDetails): void {
    const message = this.formatErrorMessage(error);
    notifications.show(message, 'error');
  }

  private formatErrorMessage(error: ErrorDetails): string {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Failed to connect to the server. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please try again.';
      case 'TYPE_ERROR':
        return 'Invalid data format received.';
      default:
        return `An error occurred: ${error.message}`;
    }
  }

  private cleanup(): void {
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.errors.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1;
    });
    return stats;
  }

  clearErrors(): void {
    this.errors = [];
  }
}