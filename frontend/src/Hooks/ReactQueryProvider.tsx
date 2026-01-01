"use client";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import type { ReactNode } from "react";

// Only load devtools in development
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
    import("@tanstack/react-query-devtools").then((mod) => ({
      default: mod.ReactQueryDevtools,
    }))
  )
  : () => null;

// Export queryClient so it can be cleared on login/logout
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 15,        // 15 minutes - keep in cache (increased from 10)
      refetchOnWindowFocus: false,   // Don't refetch when tab gets focus
      refetchOnMount: false,         // Don't refetch when component mounts if data exists
      refetchOnReconnect: true,      // Refetch when coming back online
      retry: 1,                      // Only retry failed requests once
      networkMode: 'offlineFirst',   // Use cache first, then network
    },
  },
});

// Query key constants for consistent cache management
export const QUERY_KEYS = {
  // Static data - long cache times
  CATEGORIES: ['categories'] as const,
  COURSES: ['courses'] as const,
  ACTIVE_COURSES: ['activeCourses'] as const,
  LESSONS: ['lessons'] as const,
  OFFERS: ['offers'] as const,
  REVIEWS: ['reviews'] as const,

  // Dynamic data - shorter cache times
  DASHBOARD: ['dashboard'] as const,
  USERS: ['users'] as const,
  PAYMENTS: ['payments'] as const,

  // User-specific data
  LOGIN: ['login'] as const,
  STUDENT_PROFILE: ['studentProfile'] as const,
} as const;

// Cache time presets (in milliseconds)
export const CACHE_TIMES = {
  // Very static data (categories, course structure)
  LONG: {
    staleTime: 1000 * 60 * 30,   // 30 minutes
    gcTime: 1000 * 60 * 60,      // 1 hour
  },
  // Semi-static data (courses, offers)
  MEDIUM: {
    staleTime: 1000 * 60 * 15,   // 15 minutes
    gcTime: 1000 * 60 * 30,      // 30 minutes
  },
  // Dynamic data (dashboard, user data)
  SHORT: {
    staleTime: 1000 * 60 * 2,    // 2 minutes
    gcTime: 1000 * 60 * 5,       // 5 minutes
  },
  // Real-time data (payments, notifications)
  NONE: {
    staleTime: 0,
    gcTime: 1000 * 60 * 1,       // 1 minute
  },
} as const;

export function ReactQueryProvider({
  children,
  dehydratedState,
}: {
  children: ReactNode;
  dehydratedState?: unknown;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        {children}
      </HydrationBoundary>
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
