"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ManualContentProps {
  content: string;
}

export function ManualContent({ content }: ManualContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-img:rounded-lg prose-pre:bg-muted prose-pre:text-muted-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
