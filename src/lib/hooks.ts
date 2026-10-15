import { useEffect } from "react";
import { Api } from "./api";
import { useApi } from "./useApi";
import type { Health } from "./types";

export function useTitle(title?: string | null, subtitle?: string | null) {
  useEffect(() => {
    const parts = [title, subtitle, "StreamX"].filter(Boolean);
    document.title = parts.join(" · ");
    return () => {
      document.title = "StreamX — Movies & Series";
    };
  }, [title, subtitle]);
}

export function useHealth(): Health | null {
  const { data } = useApi(() => Api.health(), []);
  return data;
}
