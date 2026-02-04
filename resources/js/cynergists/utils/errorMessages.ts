/**
 * Utility functions for formatting user-friendly error messages
 */

/**
 * Checks if an error message indicates a duplicate record
 */
export function isDuplicateError(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return (
        lowerMessage.includes('duplicate') ||
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('unique constraint') ||
        lowerMessage.includes('unique_violation') ||
        lowerMessage.includes('23505') // PostgreSQL unique violation error code
    );
}

/**
 * Formats an error message for display to users
 * Converts technical duplicate errors to friendly messages
 */
export function formatErrorMessage(
    message: string,
    entityType?: string,
): string {
    if (isDuplicateError(message)) {
        const entity = entityType || 'record';
        return `This ${entity} already exists. Duplicates are not allowed.`;
    }
    return message;
}

/**
 * Checks if an error indicates the user already exists (for registration)
 */
export function isUserExistsError(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return (
        lowerMessage.includes('user already registered') ||
        lowerMessage.includes('already registered') ||
        lowerMessage.includes('email already') ||
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('duplicate') ||
        lowerMessage.includes('account already')
    );
}
