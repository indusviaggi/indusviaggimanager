"use client";

import {
  useRouter as useAppRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useMemo } from "react";

export function useRouter() {
  const router = useAppRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(
    () => ({
      push: (url: string | { pathname: string; query?: Record<string, string> }) => {
        if (typeof url === "string") {
          router.push(url);
        } else {
          const qs = url.query
            ? "?" + new URLSearchParams(url.query).toString()
            : "";
          router.push(url.pathname + qs);
        }
        return Promise.resolve(true);
      },
      replace: (url: string) => {
        router.replace(url);
        return Promise.resolve(true);
      },
      back: () => router.back(),
      pathname,
      asPath: pathname,
      query: Object.fromEntries(searchParams.entries()),
      events: {
        on: () => {},
        off: () => {},
      },
    }),
    [router, pathname, searchParams]
  );
}

const Router = {
  push: (url: string | { pathname: string; query?: Record<string, string> }) => {
    if (typeof window === "undefined") return Promise.resolve(true);
    if (typeof url === "string") {
      window.location.href = url;
    } else {
      const qs = url.query
        ? "?" + new URLSearchParams(url.query).toString()
        : "";
      window.location.href = url.pathname + qs;
    }
    return Promise.resolve(true);
  },
};

export default Router;
