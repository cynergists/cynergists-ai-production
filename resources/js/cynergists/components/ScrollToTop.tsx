import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const ScrollToTop = () => {
    const { url } = usePage();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [url]);

    return null;
};

export default ScrollToTop;
