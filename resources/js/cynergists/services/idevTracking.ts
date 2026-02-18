/**
 * iDevAffiliate Tracking Service
 * Handles affiliate link tracking and conversion reporting
 */

interface ConversionData {
    orderId: string;
    amount: number;
    customerName?: string;
    customerEmail?: string;
    products?: string;
}

export class IDevTracking {
    private static profile = '72198'; // iDevAffiliate profile ID
    private static baseUrl = 'https://cynergists.idevaffiliate.com';

    /**
     * Track page view for affiliate cookie
     * Call this on app initialization to set affiliate tracking cookie
     */
    static trackPageView(): void {
        if (!this.profile) {
            console.warn('iDevAffiliate: Profile ID not configured');
            return;
        }

        try {
            const img = document.createElement('img');
            img.style.border = '0';
            img.style.display = 'none';
            img.style.position = 'absolute';
            img.style.top = '-9999px';
            img.alt = '';
            img.src = `${this.baseUrl}/track.php?profile=${this.profile}`;
            
            if (document.body) {
                document.body.appendChild(img);
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(img);
                });
            }

            console.log('iDevAffiliate: Page view tracked');
        } catch (error) {
            console.error('iDevAffiliate: Failed to track page view', error);
        }
    }

    /**
     * Track conversion/sale
     * Call this after successful checkout
     */
    static trackConversion(data: ConversionData): void {
        if (!this.profile) {
            console.warn('iDevAffiliate: Profile ID not configured');
            return;
        }

        try {
            const params = new URLSearchParams({
                profile: this.profile,
                idev_saleamt: data.amount.toFixed(2),
                idev_ordernum: data.orderId,
            });

            if (data.customerName) {
                params.append('idev_option_1', data.customerName);
            }
            if (data.customerEmail) {
                params.append('idev_option_2', data.customerEmail);
            }
            if (data.products) {
                params.append('idev_option_3', data.products);
            }

            const img = document.createElement('img');
            img.style.border = '0';
            img.style.display = 'none';
            img.style.position = 'absolute';
            img.style.top = '-9999px';
            img.alt = '';
            img.src = `${this.baseUrl}/sale.php?${params.toString()}`;
            
            document.body.appendChild(img);

            console.log('iDevAffiliate: Conversion tracked', {
                orderId: data.orderId,
                amount: data.amount,
            });
        } catch (error) {
            console.error('iDevAffiliate: Failed to track conversion', error);
        }
    }

    /**
     * Get current affiliate ID from cookie
     */
    static getAffiliateId(): string | null {
        try {
            const match = document.cookie.match(/idev_tracking_id=([^;]+)/);
            return match ? match[1] : null;
        } catch (error) {
            console.error('iDevAffiliate: Failed to get affiliate ID', error);
            return null;
        }
    }

    /**
     * Check if current visitor came from an affiliate link
     */
    static isAffiliate(): boolean {
        return this.getAffiliateId() !== null;
    }
}
