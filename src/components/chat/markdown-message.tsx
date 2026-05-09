"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownMessageProps = {
  content: string;
};

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div
      className={[
        "max-w-none text-sm leading-relaxed text-[#5d3c42]",
        "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        "[&_strong]:font-semibold [&_strong]:text-[#7a3f45]",
        "[&_em]:font-medium [&_em]:text-[#b85c7a] [&_em]:not-italic",
        "[&_blockquote]:my-2 [&_blockquote]:rounded-r-xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#d88ca9] [&_blockquote]:bg-[#fff5f9] [&_blockquote]:px-3 [&_blockquote]:py-2 [&_blockquote]:text-[#6a4a50]",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:my-0.5 [&_li]:marker:text-[#d88ca9]",
        "[&_h1]:section-title [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:text-[#6f3f45]",
        "[&_h2]:section-title [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-lg [&_h2]:text-[#6f3f45]",
        "[&_h3]:font-semibold [&_h3]:text-[#6f3f45]",
        "[&_code]:rounded-md [&_code]:bg-[#fff0f5] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-[#7a3f45]",
        "[&_a]:font-medium [&_a]:text-[#b85c7a] [&_a]:underline [&_a]:underline-offset-2",
        "[&_hr]:my-3 [&_hr]:border-[#f1c5d3]",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
