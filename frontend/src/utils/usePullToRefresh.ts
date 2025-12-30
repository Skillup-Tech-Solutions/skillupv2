import { useState, useEffect, useCallback } from 'react';
import { triggerHaptic } from './pwaUtils';

export interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
}

export const usePullToRefresh = ({ onRefresh, threshold = 80 }: PullToRefreshOptions) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const onTouchStart = useCallback((e: TouchEvent) => {
        // Only allow pull-to-refresh when at the top of the page
        if (window.scrollY === 0) {
            setTouchStart(e.touches[0].clientY);
        }
    }, []);

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (touchStart === null || isRefreshing) return;

        const currentTouch = e.touches[0].clientY;
        const distance = currentTouch - touchStart;

        if (distance > 0) {
            // Apply resistance
            const pull = Math.pow(distance, 0.8);
            setPullDistance(pull);

            // Prevent scrolling if pulling down
            if (pull > 5 && e.cancelable) {
                e.preventDefault();
            }

            // Haptic feedback when threshold met
            if (pull >= threshold && pullDistance < threshold) {
                triggerHaptic('medium');
            }
        }
    }, [touchStart, isRefreshing, threshold, pullDistance]);

    const onTouchEnd = useCallback(async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(threshold); // Move to refreshing position

            try {
                await onRefresh();
            } finally {
                // Smoothly animate back
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
        setTouchStart(null);
    }, [pullDistance, threshold, isRefreshing, onRefresh]);

    useEffect(() => {
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        window.addEventListener('touchend', onTouchEnd);

        return () => {
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [onTouchStart, onTouchMove, onTouchEnd]);

    return { pullDistance, isRefreshing };
};
