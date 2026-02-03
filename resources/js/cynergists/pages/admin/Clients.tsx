import { router } from '@inertiajs/react';
import { useEffect } from 'react';

// Clients management has been moved to the Client Portal
// This component redirects users to the new location
export default function Clients() {
    useEffect(() => {
        router.visit('/admin/client-portal');
    }, []);

    return null;
}
