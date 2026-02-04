import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseAutoSaveOptions<T> {
    /** The data to auto-save */
    data: T;
    /** Function to call when saving */
    onSave: (data: T) => Promise<boolean | void>;
    /** Debounce delay in milliseconds (default: 1000ms) */
    delay?: number;
    /** Whether autosave is enabled (default: true) */
    enabled?: boolean;
    /** Initial data to compare against (to prevent saving unchanged data) */
    initialData?: T;
    /** Show toast notifications on save (default: true) */
    showToast?: boolean;
}

/**
 * useAutoSave - A hook for automatic field-level saving with debounce
 *
 * This hook automatically saves form data after a short delay when changes are detected.
 * Use this for all admin drawer forms to enable autosave functionality.
 *
 * @example
 * const { isSaving, lastSaved } = useAutoSave({
 *   data: formData,
 *   onSave: async (data) => {
 *     await updateRecord(id, data);
 *     return true;
 *   },
 *   enabled: !!recordId, // Only enable for existing records
 * });
 */
export function useAutoSave<T extends Record<string, unknown>>({
    data,
    onSave,
    delay = 1000,
    enabled = true,
    initialData,
    showToast = true,
}: UseAutoSaveOptions<T>) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const previousDataRef = useRef<string>(JSON.stringify(initialData ?? data));
    const isFirstRender = useRef(true);
    const pendingSaveRef = useRef<T | null>(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Reset refs when initialData changes (e.g., switching records)
    useEffect(() => {
        if (initialData) {
            previousDataRef.current = JSON.stringify(initialData);
            isFirstRender.current = true;
        }
    }, [initialData]);

    const performSave = useCallback(
        async (dataToSave: T) => {
            setIsSaving(true);
            try {
                const result = await onSave(dataToSave);
                if (result !== false) {
                    setLastSaved(new Date());
                    previousDataRef.current = JSON.stringify(dataToSave);
                    if (showToast) {
                        toast.success('Saved', { duration: 1500 });
                    }
                }
            } catch (error) {
                console.error('Auto-save failed:', error);
                if (showToast) {
                    toast.error('Failed to save changes');
                }
            } finally {
                setIsSaving(false);
                pendingSaveRef.current = null;
            }
        },
        [onSave, showToast],
    );

    // Watch for data changes and trigger debounced save
    useEffect(() => {
        if (!enabled) return;

        // Skip first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const currentDataStr = JSON.stringify(data);

        // Don't save if data hasn't changed
        if (currentDataStr === previousDataRef.current) {
            return;
        }

        // Store the pending save data
        pendingSaveRef.current = data;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            if (pendingSaveRef.current) {
                performSave(pendingSaveRef.current);
            }
        }, delay);
    }, [data, enabled, delay, performSave]);

    // Force save immediately (useful for cleanup or urgent saves)
    const saveNow = useCallback(async () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        const currentDataStr = JSON.stringify(data);
        if (currentDataStr !== previousDataRef.current) {
            await performSave(data);
        }
    }, [data, performSave]);

    return {
        isSaving,
        lastSaved,
        saveNow,
    };
}
