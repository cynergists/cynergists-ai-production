import { useCallback, useEffect, useState } from 'react';

/**
 * useStickyForm - A hook for persistent form state across sessions
 *
 * This hook automatically saves form data to localStorage and restores it
 * when the user returns to the page. Use this for all forms site-wide.
 *
 * @param storageKey - Unique key for localStorage (e.g., "partner-application-form")
 * @param initialData - Default form values
 * @returns [formData, setFormData, clearFormData]
 *
 * @example
 * const [formData, setFormData, clearFormData] = useStickyForm("contact-form", {
 *   name: "",
 *   email: "",
 * });
 *
 * // On input change
 * const handleChange = (e) => {
 *   setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
 * };
 *
 * // On successful submission, clear the saved data
 * clearFormData();
 */
export function useStickyForm<T extends Record<string, unknown>>(
    storageKey: string,
    initialData: T,
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
    // Initialize state with saved data or defaults
    const [formData, setFormData] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Merge with initial data to handle new fields
                return { ...initialData, ...parsed };
            }
        } catch (error) {
            console.warn(`Failed to load form data for ${storageKey}:`, error);
        }
        return initialData;
    });

    // Save to localStorage whenever form data changes
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(formData));
        } catch (error) {
            console.warn(`Failed to save form data for ${storageKey}:`, error);
        }
    }, [storageKey, formData]);

    // Clear saved form data (call after successful submission)
    const clearFormData = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            setFormData(initialData);
        } catch (error) {
            console.warn(`Failed to clear form data for ${storageKey}:`, error);
        }
    }, [storageKey, initialData]);

    return [formData, setFormData, clearFormData];
}
