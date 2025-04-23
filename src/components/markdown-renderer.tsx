import React, { useEffect, useRef } from "react";
import { Marked } from "marked";
import { cn } from "@/lib/utils";
import "github-markdown-css/github-markdown-light.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

// 마크다운 렌더링을 위한 설정
const marked = new Marked({
  gfm: true,
  breaks: true,
  pedantic: false,
});

// 코드 하이라이팅 설정
const renderer = {
  code(code: string, language: string | undefined) {
    const lang = language || '';
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch (err) {
        console.error(err);
      }
    }
    
    const highlighted = hljs.highlightAuto(code).value;
    return `<pre><code class="hljs">${highlighted}</code></pre>`;
  }
};

marked.use({ renderer });

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const markdownRef = useRef<HTMLDivElement>(null);

  // 마크다운 렌더링
  useEffect(() => {
    if (markdownRef.current) {
      marked.parse(content).then((html) => {
        markdownRef.current!.innerHTML = html;
      });
    }
  }, [content]);

  return (
    <div 
      className={cn(
        "markdown-body prose max-w-none",
        "prose-headings:text-primary prose-h1:text-2xl prose-h1:font-bold prose-h2:text-xl",
        "prose-p:my-3 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline",
        "prose-img:rounded-md prose-img:my-4",
        "prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-md",
        "prose-li:my-1 prose-ul:pl-6 prose-ol:pl-6",
        "prose-table:border-collapse prose-table:my-4 prose-table:w-full",
        "prose-th:border prose-th:p-2 prose-th:bg-gray-100 prose-th:text-left",
        "prose-td:border prose-td:p-2",
        "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-4 prose-blockquote:italic",
        className
      )}
      ref={markdownRef}
    />
  );
} 