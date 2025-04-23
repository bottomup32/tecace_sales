import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Document } from "@/lib/document-service";

interface MainLayoutProps {
  children: ReactNode;
  documents: Document[];
}

export function MainLayout({ children, documents }: MainLayoutProps) {
  const router = useRouter();
  const { id } = router.query;

  // 중복 제거를 위해 문서 ID 기반으로 필터링
  const uniqueDocuments = Array.from(
    new Map(documents.map(doc => [doc.id, doc])).values()
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            TecAce 문서 뷰어
          </Link>
          <div className="flex space-x-4">
            <Link 
              href="/" 
              className="text-sm font-medium hover:text-primary-foreground/80 transition-colors"
            >
              홈
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row">
        <nav className="w-full md:w-64 lg:w-72 border-r shrink-0 bg-secondary/30 shadow-inner">
          <div className="p-4 sticky top-0">
            <h2 className="text-lg font-semibold mb-4 text-accent flex items-center">
              <span className="inline-block w-2 h-5 bg-accent mr-2 rounded-sm"></span>
              문서 목록 ({uniqueDocuments.length})
            </h2>
            
            {uniqueDocuments.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 bg-background rounded-md">
                문서를 불러오는 중...
              </div>
            ) : (
              <ul className="space-y-1">
                {uniqueDocuments.map((doc) => (
                  <li key={doc.id}>
                    <Link
                      href={`/document/${doc.id}`}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-all",
                        id === doc.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-secondary hover:translate-x-1 transition-transform"
                      )}
                    >
                      {doc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 