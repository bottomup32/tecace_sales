import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HtmlMarkdownRenderer } from "./html-markdown-renderer";
import { Edit, Eye, Save, X } from "lucide-react";

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => void;
  className?: string;
}

export function MarkdownEditor({ content, onSave, className }: MarkdownEditorProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // JSON 문자열 또는 이스케이프된 문자 처리
    let processedContent = content;
    
    if (typeof content === 'string') {
      // JSON 문자열인 경우
      if (content.startsWith('"') && content.endsWith('"')) {
        try {
          processedContent = JSON.parse(content);
          console.log("Processed JSON string in markdown editor");
        } catch (err) {
          console.error("Error parsing JSON string in editor:", err);
        }
      }
      
      // 이스케이프된 문자 처리
      processedContent = processedContent.replace(/\\n/g, '\n');
      processedContent = processedContent.replace(/\\"/g, '"');
    }
    
    setEditedContent(processedContent);
  }, [content]);

  const handleSave = () => {
    // 내용 정상화 - 이스케이프된 문자 처리
    let normalizedContent = editedContent;
    
    // 저장 시에는 원래 내용을 그대로 보존하여 저장
    // 이스케이프된 줄바꿈이나 따옴표가 있으면 실제 문자로 변환
    normalizedContent = normalizedContent.replace(/\\n/g, '\n');
    normalizedContent = normalizedContent.replace(/\\"/g, '"');
    
    onSave(normalizedContent);
    setEditMode(false);
  };

  const handleCancel = () => {
    // JSON 문자열 처리
    let processedContent = content;
    
    if (typeof content === 'string') {
      // JSON 문자열인 경우
      if (content.startsWith('"') && content.endsWith('"')) {
        try {
          processedContent = JSON.parse(content);
        } catch (err) {
          console.error("Error parsing JSON string on cancel:", err);
        }
      }
      
      // 이스케이프된 문자 처리
      processedContent = processedContent.replace(/\\n/g, '\n');
      processedContent = processedContent.replace(/\\"/g, '"');
    }
    
    setEditedContent(processedContent);
    setEditMode(false);
  };

  if (editMode) {
    return (
      <div className={cn("flex flex-col space-y-4", className)}>
        <div className="flex items-center justify-between mb-4 bg-secondary/50 rounded-md p-3 shadow-sm">
          <div className="flex space-x-2">
            <Button
              variant={isPreview ? "outline" : "default"}
              size="sm"
              onClick={() => setIsPreview(false)}
              className={!isPreview ? "bg-accent hover:bg-accent/90" : ""}
            >
              <Edit className="h-4 w-4 mr-2" />
              편집
            </Button>
            <Button
              variant={isPreview ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPreview(true)}
              className={isPreview ? "bg-accent hover:bg-accent/90" : ""}
            >
              <Eye className="h-4 w-4 mr-2" />
              미리보기
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              취소
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </div>
        </div>

        <div className="border rounded-md shadow-sm overflow-hidden">
          {isPreview ? (
            <div className="p-4 min-h-[400px] overflow-auto">
              <HtmlMarkdownRenderer content={editedContent} />
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="bg-secondary/30 px-4 py-2 text-xs font-mono text-muted-foreground border-b">
                markdown
              </div>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[400px] p-4 focus:outline-none focus:ring-0 resize-none font-mono text-sm"
                autoFocus
                spellCheck="false"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm"
        onClick={() => setEditMode(true)}
      >
        <Edit className="h-4 w-4 mr-2" />
        편집
      </Button>
      <div className="border rounded-md p-6 min-h-[400px] overflow-auto shadow-sm">
        <HtmlMarkdownRenderer content={content} />
      </div>
    </div>
  );
} 