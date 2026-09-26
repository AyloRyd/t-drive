"use client";

import { useQuery } from "@tanstack/react-query";
import { getFilePreview } from "~/server/actions/file.actions";

/**
 * Text content is fetched and highlighted server-side rather than in the
 * browser: it keeps the Shiki grammars out of the client bundle and avoids
 * depending on the storage CDN's CORS headers.
 */
export function useFilePreview(fileId: string) {
  return useQuery({
    queryKey: ["file-preview", fileId],
    queryFn: async () => {
      const res = await getFilePreview(fileId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
