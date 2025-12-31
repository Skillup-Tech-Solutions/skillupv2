import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';

const AnalyticsWrapper = ({ children }: { children?: React.ReactNode }) => {
    const location = useLocation();

    useEffect(() => {
        // Log screen view on route change
        const screenName = location.pathname;
        analyticsService.logScreenView(screenName);
    }, [location]);

    return <>{children}</>;
};

export default AnalyticsWrapper;
