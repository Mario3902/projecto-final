import { useState, useEffect } from 'react';

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check if the user agent matches a mobile device or if the screen width is small
        const checkIsMobile = () => {
            const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
            const mobileRegx = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

            const isMobileDevice = mobileRegx.test(userAgent);
            const isSmallScreen = window.innerWidth <= 768;

            setIsMobile(isMobileDevice || isSmallScreen);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    return isMobile;
}
