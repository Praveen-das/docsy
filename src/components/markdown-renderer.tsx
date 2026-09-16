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
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0a0b12] text-zinc-100 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#12141f] border-b border-white/5 text-[11px] font-mono text-zinc-400">
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
  onCitationClick?: (pageNumber: number) => void;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
  onCitationClick,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "markdown-content text-sm text-zinc-200 leading-relaxed font-normal break-words space-y-3",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-white mt-5 mb-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold text-white mt-4 mb-2 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-white mt-3 mb-1 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 leading-relaxed text-zinc-300">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 my-2 space-y-1.5 text-zinc-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1.5 text-zinc-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // Blockquote with vibrant purple left accent matching Image 2
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#8b5cf6] bg-[#121422] pl-4 pr-3 py-3 my-3 rounded-r-xl text-zinc-200 shadow-sm leading-relaxed">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 underline font-medium underline-offset-2"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="my-4 border-white/10" />,
          // Clean comparison table matching Image 2
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-[#0d0e17] shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#131520] border-b border-white/10 text-white font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left font-semibold text-zinc-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 border-b border-white/[0.05] last:border-b-0 text-zinc-300">
              {children}
            </td>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const isInline = !match && !String(children).includes("\n");
            const textStr = String(children);

            // Special Citation Pill badge detection (e.g. "p. 6", "[p. 12]")
            if (isInline && /^p\.\s*\d+$/i.test(textStr.trim())) {
              const pageNum = parseInt(textStr.replace(/\D/g, ""), 10);
              return (
                <button
                  type="button"
                  onClick={() => onCitationClick?.(pageNum)}
                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#1d1f33] text-[11px] font-mono font-medium text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/50 hover:border-indigo-400 transition-colors mx-1 cursor-pointer"
                  title={`Jump to Page ${pageNum}`}
                >
                  {textStr}
                </button>
              );
            }

            if (isInline) {
              return (
                <code
                  className="rounded px-1.5 py-0.5 bg-white/10 font-mono text-[12px] text-zinc-100 font-medium"
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
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
