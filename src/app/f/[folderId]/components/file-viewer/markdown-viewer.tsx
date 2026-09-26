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
      <TabsList className="h-10 w-full shrink-0 justify-start gap-0 rounded-none border-b border-gray-700/50 bg-gray-950/40 p-0">
        <TabsTrigger
          value="preview"
          className="relative h-10 flex-1 cursor-pointer gap-2 rounded-none border-r border-gray-700/40 px-4 text-xs font-medium text-gray-500 transition-colors before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-teal-400 before:opacity-0 hover:text-gray-300 data-active:bg-gray-900 data-active:text-white data-active:shadow-none data-active:before:opacity-100"
        >
          <Eye size={13} />
          Preview
        </TabsTrigger>
        <TabsTrigger
          value="source"
          className="relative h-10 flex-1 cursor-pointer gap-2 rounded-none border-r border-gray-700/40 px-4 text-xs font-medium text-gray-500 transition-colors before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-teal-400 before:opacity-0 hover:text-gray-300 data-active:bg-gray-900 data-active:text-white data-active:shadow-none data-active:before:opacity-100"
        >
          <FileCode2 size={13} />
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
