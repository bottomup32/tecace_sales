import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Document, documentService } from "@/lib/document-service";
import { MainLayout } from "@/components/main-layout";
import { MarkdownEditor } from "@/components/markdown-editor";
import { Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";

export default function DocumentPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모든 문서 로드
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        // 문서 서비스 캐시를 초기화하여 항상 최신 데이터를 가져옵니다
        documentService.clearCache();
        const docs = await documentService.getAllDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error("문서 목록을 불러오는 중 오류가 발생했습니다:", err);
        setError("문서 목록을 불러오는 중 오류가 발생했습니다.");
      }
    };

    loadDocuments();
  }, []);

  // 개별 문서 로드
  useEffect(() => {
    const loadDocument = async () => {
      if (id && typeof id === 'string') {
        setLoading(true);
        setError(null);
        
        try {
          const doc = await documentService.getDocument(id);
          if (doc) {
            setDocument(doc);
          } else {
            setError("요청한 문서를 찾을 수 없습니다.");
            // 3초 후 홈으로 리디렉션
            setTimeout(() => router.push('/'), 3000);
          }
        } catch (err) {
          console.error("문서를 불러오는 중 오류가 발생했습니다:", err);
          setError("문서를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadDocument();
  }, [id, router]);

  const handleSave = async (content: string) => {
    if (document) {
      try {
        const success = await documentService.saveDocument(document.id, content);
        if (success) {
          setDocument({ ...document, content });
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 3000);
        } else {
          setError("문서를 저장하는 중 오류가 발생했습니다.");
        }
      } catch (err) {
        console.error("문서를 저장하는 중 오류가 발생했습니다:", err);
        setError("문서를 저장하는 중 오류가 발생했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <MainLayout documents={documents}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">문서를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout documents={documents}>
        <div className="flex justify-center items-center h-64">
          <div className="bg-destructive/10 text-destructive p-6 rounded-md max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">오류</h2>
            <p>{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout documents={documents}>
        <div className="flex justify-center items-center h-64">
          <div className="bg-destructive/10 text-destructive p-6 rounded-md max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">문서를 찾을 수 없습니다</h2>
            <p>요청하신 문서를 찾을 수 없습니다. 문서 목록에서 다른 문서를 선택해주세요.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout documents={documents}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-md mb-6 shadow-sm">
          <h1 className="text-3xl font-bold text-primary">{document.title}</h1>
        </div>
        
        <MarkdownEditor 
          content={document.content} 
          onSave={handleSave}
          className="mb-6"
        />
      </div>

      {showSaveToast && (
        <Toast variant="default" className="fixed bottom-4 right-4 bg-accent text-accent-foreground shadow-lg">
          <ToastTitle>저장됨</ToastTitle>
          <ToastDescription>문서가 성공적으로 저장되었습니다.</ToastDescription>
        </Toast>
      )}
    </MainLayout>
  );
} 