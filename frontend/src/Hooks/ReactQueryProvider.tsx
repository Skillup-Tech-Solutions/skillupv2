"use client";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { HydrationBoundary } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes - data considered fresh
      gcTime: 1000 * 60 * 10,        // 10 minutes - keep in cache
      refetchOnWindowFocus: false,   // Don't refetch when tab gets focus
      refetchOnMount: false,         // Don't refetch when component mounts if data exists
      retry: 1,                      // Only retry failed requests once
    },
  },
});

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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
