import React from "react";
import { cn } from "@/lib/utils";

interface HtmlMarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * 마크다운 문자열을 HTML로 직접 변환하여 렌더링하는 컴포넌트
 */
export function HtmlMarkdownRenderer({ content, className }: HtmlMarkdownRendererProps) {
  // 입력된 content가 JSON 문자열인지 확인하고 처리
  let processedContent = content;
  
  // 모든 문자열 데이터가 JSON 형식인지 확인
  if (typeof content === 'string') {
    if (content.startsWith('"') && content.endsWith('"')) {
      try {
        // JSON 문자열인 경우 파싱
        processedContent = JSON.parse(content);
        console.log("Parsed JSON string content successfully");
      } catch (err) {
        console.error("Error parsing JSON string:", err);
      }
    }
    
    // 이스케이프된 줄바꿈 문자를 실제 줄바꿈으로 변환
    processedContent = processedContent.replace(/\\n/g, '\n');
  }

  // 마크다운을 HTML로 변환
  const htmlContent = convertMarkdownToHtml(processedContent);

  return (
    <div 
      className={cn(
        "markdown-content text-base",
        className
      )}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

/**
 * 마크다운 문자열을 HTML로 변환하는 함수
 */
function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // 줄바꿈 처리
  let html = markdown
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // 이스케이프된 줄바꿈과 따옴표 처리
  html = html.replace(/\\n/g, '\n');
  html = html.replace(/\\"/g, '"');

  // 헤더 변환 (# Header)
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold my-6 text-primary border-b pb-2">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-semibold my-5 text-primary">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xl font-semibold my-4 text-primary">$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4 class="text-lg font-semibold my-4 text-primary">$1</h4>');
  html = html.replace(/^##### (.*?)$/gm, '<h5 class="text-base font-semibold my-4 text-primary">$1</h5>');
  html = html.replace(/^###### (.*?)$/gm, '<h6 class="text-sm font-semibold my-4 text-primary">$1</h6>');

  // 강조 (볼드, 이탤릭)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/__(.*?)__/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/_(.*?)_/g, '<em class="italic">$1</em>');

  // 인용구 (>)
  html = html.replace(/^>\s*(.*?)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 py-2 my-6 italic bg-secondary/30 rounded-r">$1</blockquote>');

  // 코드 블록 처리
  html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, code) => {
    return `<pre class="bg-gray-100 p-4 rounded-md my-6 overflow-auto shadow-sm"><code class="language-${language || 'plaintext'} text-sm font-mono">${escapeHtml(code.trim())}</code></pre>`;
  });

  // 인라인 코드 처리
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-primary/80">$1</code>');

  // 순서 없는 목록
  // 줄 단위로 처리
  let lines = html.split('\n');
  let inList = false;
  let listItems = [];
  let result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const unorderedListMatch = line.match(/^\s*[-*+]\s+(.*?)$/);
    
    if (unorderedListMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(`<li class="ml-6 my-2 text-base">${unorderedListMatch[1]}</li>`);
    } else if (inList) {
      inList = false;
      result.push(`<ul class="list-disc pl-6 my-6">${listItems.join('')}</ul>`);
      result.push(line);
    } else {
      result.push(line);
    }
  }

  if (inList) {
    result.push(`<ul class="list-disc pl-6 my-6">${listItems.join('')}</ul>`);
  }

  html = result.join('\n');

  // 순서 있는 목록을 다시 처리
  lines = html.split('\n');
  inList = false;
  listItems = [];
  result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const orderedListMatch = line.match(/^\s*(\d+)\.\s+(.*?)$/);
    
    if (orderedListMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(`<li class="ml-6 my-2 text-base">${orderedListMatch[2]}</li>`);
    } else if (inList) {
      inList = false;
      result.push(`<ol class="list-decimal pl-6 my-6">${listItems.join('')}</ol>`);
      result.push(line);
    } else {
      result.push(line);
    }
  }

  if (inList) {
    result.push(`<ol class="list-decimal pl-6 my-6">${listItems.join('')}</ol>`);
  }

  html = result.join('\n');

  // 링크 변환
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent hover:text-accent/80 underline transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');

  // 이미지 변환
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-6 shadow-sm" />');

  // 수평선
  html = html.replace(/^---$/gm, '<hr class="my-8 border-t border-gray-300" />');

  // 표 처리 (간단한 표만 지원)
  // 표 헤더 행과 분리자 행 패턴 (수정된 패턴)
  const tablePattern = /^\|(.+)\|\s*\n\|([-:\s|]+)\|\s*\n/gm;
  
  // 표 처리
  html = html.replace(tablePattern, (match, headerRow, separatorRow) => {
    const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean);
    
    const thCells = headers.map((h: string) => 
      `<th class="border border-gray-300 px-4 py-2 bg-gray-100 text-left font-semibold">${h}</th>`
    ).join('');
    
    return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse shadow-sm"><thead><tr>${thCells}</tr></thead><tbody>`;
  });
  
  // 표 내용 행 처리
  const tableRowPattern = /^\|(.+)\|\s*$/gm;
  html = html.replace(tableRowPattern, (match, rowContent) => {
    // 이미 테이블 헤더로 처리된 행은 건너뛰기
    if (match.includes('<table')) return match;
    
    const cells = rowContent.split('|').map((c: string) => c.trim()).filter(Boolean);
    const tdCells = cells.map((c: string) => 
      `<td class="border border-gray-300 px-4 py-2">${c}</td>`
    ).join('');
    
    return `<tr>${tdCells}</tr>`;
  });
  
  // 표 닫기 (마지막 행 뒤에 닫는 태그 추가)
  html = html.replace(/<\/tr>\s*(?!<tr|<\/tbody>)/g, '</tr></tbody></table></div>');

  // 단락 처리 (다른 요소로 감싸지지 않은 텍스트)
  // HTML 태그로 시작하지 않는 줄만 <p> 태그로 감싸기
  lines = html.split('\n');
  result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('<') && !line.match(/^\s*$/)) {
      result.push(`<p class="my-4 leading-7 text-base">${line}</p>`);
    } else if (line) {
      result.push(line);
    }
  }

  html = result.join('\n');

  return html;
}

// HTML 이스케이프 함수
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
} 