/**
 * Partner Attribution Storage Utilities
 * Stores partner referral data in both cookie and localStorage with 180-day expiry
 */

export interface AttributionData {
    partner_id: string;
    partner_slug: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    landing_page_url: string;
    referrer_url: string;
    stored_at: number;
}

const COOKIE_NAME = 'cynergists_partner_ref';
const STORAGE_KEY = 'cynergists_partner_attribution';
const EXPIRY_DAYS = 180;

/**
 * Set a cookie with the given name, value, and expiry days
 */
function setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(cookie.substring(nameEQ.length));
        }
    }
    return null;
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Parse UTM parameters from URL
 */
export function parseUtmParams(): Partial<AttributionData> {
    if (typeof window === 'undefined') return {};

    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        utm_content: params.get('utm_content') || undefined,
        utm_term: params.get('utm_term') || undefined,
    };
}

/**
 * Store attribution data in both cookie and localStorage
 */
export function storeAttribution(
    data: Omit<AttributionData, 'stored_at'>,
): void {
    const attributionData: AttributionData = {
        ...data,
        stored_at: Date.now(),
    };

    const jsonData = JSON.stringify(attributionData);

    // Store in cookie (180 days)
    try {
        setCookie(COOKIE_NAME, jsonData, EXPIRY_DAYS);
    } catch (e) {
        console.warn('Failed to set attribution cookie:', e);
    }

    // Store in localStorage with expiry
    try {
        localStorage.setItem(STORAGE_KEY, jsonData);
    } catch (e) {
        console.warn('Failed to set attribution localStorage:', e);
    }
}

/**
 * Check if stored attribution is still valid (within 180 days)
 */
function isAttributionValid(data: AttributionData): boolean {
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - data.stored_at < expiryMs;
}

/**
 * Retrieve attribution data (prefer cookie, fallback to localStorage)
 */
export function getAttribution(): AttributionData | null {
    // Try cookie first
    try {
        const cookieData = getCookie(COOKIE_NAME);
        if (cookieData) {
            const parsed = JSON.parse(cookieData) as AttributionData;
            if (isAttributionValid(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to parse attribution cookie:', e);
    }

    // Fallback to localStorage
    try {
        const storageData = localStorage.getItem(STORAGE_KEY);
        if (storageData) {
            const parsed = JSON.parse(storageData) as AttributionData;
            if (isAttributionValid(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn('Failed to parse attribution localStorage:', e);
    }

    return null;
}

/**
 * Check if attribution exists in cookie and/or localStorage
 */
export function hasAttribution(): { cookie: boolean; localStorage: boolean } {
    let cookie = false;
    let localStoragePresent = false;

    try {
        const cookieData = getCookie(COOKIE_NAME);
        if (cookieData) {
            const parsed = JSON.parse(cookieData);
            cookie = isAttributionValid(parsed);
        }
    } catch (e) {
        // ignore
    }

    try {
        const storageData = localStorage.getItem(STORAGE_KEY);
        if (storageData) {
            const parsed = JSON.parse(storageData);
            localStoragePresent = isAttributionValid(parsed);
        }
    } catch (e) {
        // ignore
    }

    return { cookie, localStorage: localStoragePresent };
}

/**
 * Clear attribution data (typically after conversion)
 */
export function clearAttribution(): void {
    try {
        deleteCookie(COOKIE_NAME);
    } catch (e) {
        // ignore
    }

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        // ignore
    }
}

/**
 * Build attribution data from partner info and current page
 */
export function buildAttributionData(
    partnerId: string,
    partnerSlug: string,
): Omit<AttributionData, 'stored_at'> {
    const utmParams = parseUtmParams();

    return {
        partner_id: partnerId,
        partner_slug: partnerSlug,
        ...utmParams,
        landing_page_url:
            typeof window !== 'undefined' ? window.location.href : '',
        referrer_url: typeof document !== 'undefined' ? document.referrer : '',
    };
}
