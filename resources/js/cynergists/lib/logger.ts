/**
 * Production-safe logging utility
 *
 * Provides consistent logging that can be disabled in production.
 * Use this instead of console.log throughout the codebase.
 */

const isDevelopment = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
    prefix?: string;
    enabled?: boolean;
}

function createLogger(options: LoggerOptions = {}) {
    const { prefix = '', enabled = isDevelopment } = options;

    const formatMessage = (level: LogLevel, message: string): string => {
        const timestamp = new Date().toISOString();
        return prefix ? `[${prefix}] ${message}` : message;
    };

    return {
        debug: (message: string, ...args: unknown[]) => {
            if (enabled) {
                console.log(formatMessage('debug', message), ...args);
            }
        },
        info: (message: string, ...args: unknown[]) => {
            if (enabled) {
                console.info(formatMessage('info', message), ...args);
            }
        },
        warn: (message: string, ...args: unknown[]) => {
            // Warnings are always shown
            console.warn(formatMessage('warn', message), ...args);
        },
        error: (message: string, ...args: unknown[]) => {
            // Errors are always shown
            console.error(formatMessage('error', message), ...args);
        },
    };
}

// Default logger instance
export const logger = createLogger();

// Create a namespaced logger for specific modules
export const createModuleLogger = (moduleName: string) =>
    createLogger({ prefix: moduleName });

// Helper to safely extract error message from unknown error
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

export default logger;
