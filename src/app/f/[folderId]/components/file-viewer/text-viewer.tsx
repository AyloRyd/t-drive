"use client";

import type { DBFileType } from "~/server/db/schema";
import { CodeBlock, ViewerSkeleton } from "./code-block";
import { useFilePreview } from "./use-file-preview";
import { ViewerMessage } from "./viewer-message";

export function TextViewer({ file }: { file: DBFileType }) {
  const { data, isPending, error } = useFilePreview(file.id);

  if (isPending) return <ViewerSkeleton />;

  if (error || !data) {
    return (
      <ViewerMessage
        file={file}
        description={error?.message ?? "This file couldn't be loaded."}
      />
    );
  }

  return <CodeBlock html={data.html} text={data.text} />;
}
