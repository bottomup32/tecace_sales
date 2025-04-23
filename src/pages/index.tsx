import { GetStaticProps } from "next";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Document, documentService } from "@/lib/document-service";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";

interface HomePageProps {
  documents: Document[];
}

export default function HomePage({ documents: initialDocuments }: HomePageProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        // 캐시를 초기화하여 항상 최신 데이터를 가져옵니다
        documentService.clearCache();
        const docs = await documentService.getAllDocuments();
        
        // 중복 제거를 위해 문서 ID 기반으로 필터링
        const uniqueDocs = Array.from(
          new Map(docs.map(doc => [doc.id, doc])).values()
        );
        
        setDocuments(uniqueDocs);
      } catch (error) {
        console.error("문서 목록을 불러오는 중 오류가 발생했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [initialDocuments]);

  return (
    <MainLayout documents={documents}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 bg-gradient-to-r from-primary/20 to-accent/20 p-6 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-4 text-primary">TecAce 미국 시장 진출 전략 문서</h1>
          
          <p className="text-lg">
            이 애플리케이션에서 TecAce의 미국 시장 진출 전략 관련 문서들을 보고 편집할 수 있습니다.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">문서를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow bg-card group hover:bg-secondary/20"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {doc.title}
                  </h2>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-5 text-sm line-clamp-3">
                  {doc.content.slice(0, 180)}...
                </p>
                <Link href={`/document/${doc.id}`} passHref>
                  <Button 
                    variant="outline" 
                    className="bg-secondary hover:bg-secondary/80 border-primary/20 group-hover:translate-x-1 transition-transform"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    문서 열기
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // We'll fetch documents on the client-side for this project
  // In a real app, you could pre-fetch them here
  return {
    props: {
      documents: [],
    },
  };
}; 