"use client";

import { Eye, FileCode2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { DBFileType } from "~/server/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CodeBlock, ViewerSkeleton } from "./code-block";
import { useFilePreview } from "./use-file-preview";
import { ViewerMessage } from "./viewer-message";

export function MarkdownViewer({ file }: { file: DBFileType }) {
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

  return (
    <Tabs defaultValue="preview" className="h-full gap-0">
      <TabsList
        variant="line"
        className="h-9 shrink-0 border-b border-gray-700/50 px-4"
      >
        <TabsTrigger value="preview" className="px-3">
          <Eye size={14} />
          Preview
        </TabsTrigger>
        <TabsTrigger value="source" className="px-3">
          <FileCode2 size={14} />
          Source
        </TabsTrigger>
      </TabsList>

      <TabsContent value="preview" className="min-h-0 overflow-auto">
        <div className="drive-prose mx-auto max-w-3xl px-6 py-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.text}</ReactMarkdown>
        </div>
      </TabsContent>

      <TabsContent value="source" className="min-h-0 overflow-hidden">
        <CodeBlock html={data.html} text={data.text} />
      </TabsContent>
    </Tabs>
  );
}
