"use client";

import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-zinc-200 dark:border-white/10 bg-zinc-950 text-zinc-100 shadow-2xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span className="uppercase tracking-wider font-semibold text-zinc-300">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="p-3.5 overflow-x-auto">
        <pre className="font-mono text-[12.5px] leading-relaxed text-zinc-100 tab-size-2">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "markdown-content text-[13px] text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal break-words",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2 first:mt-0 pb-1 border-b border-zinc-100 dark:border-white/5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-3.5 mb-1.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 mt-2.5 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-blue-500 dark:border-blue-400 pl-3 my-2.5 italic text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-white/[0.02] py-1 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium underline-offset-2"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => (
            <hr className="my-4 border-zinc-200 dark:border-white/10" />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-zinc-200 dark:border-white/10">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50 dark:bg-white/5 border-b border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-zinc-100 font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-zinc-100 dark:border-white/5 last:border-b-0 text-zinc-700 dark:text-zinc-300">
              {children}
            </td>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="rounded px-1.5 py-0.5 bg-zinc-100 dark:bg-white/10 font-mono text-[12px] text-zinc-900 dark:text-zinc-100 font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const codeText = String(children).replace(/\n$/, "");
            const language = match ? match[1] : undefined;

            return <CodeBlock language={language} code={codeText} />;
          },
          pre: ({ children }) => {
            // Unpack pre to let CodeBlock manage its own container
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
