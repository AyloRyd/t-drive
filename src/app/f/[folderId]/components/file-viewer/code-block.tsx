import { Loader2 } from "lucide-react";

export function CodeBlock({
  html,
  text,
}: {
  html: string | null;
  text: string;
}) {
  if (html) {
    return (
      <div
        className="drive-code h-full overflow-auto"
        // Shiki escapes the source while tokenizing, so this is the highlighter's
        // own markup rather than anything that came out of the file.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="drive-code h-full overflow-auto bg-[#24292e]">
      <pre>
        <code>{text}</code>
      </pre>
    </div>
  );
}

export function ViewerSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="animate-spin text-gray-600" size={28} />
    </div>
  );
}
