export interface Document {
  id: string;
  title: string;
  filename: string;
  content: string;
}

class DocumentService {
  private docs: Document[] = [];
  private initialized = false;
  private documentCache: Record<string, string> = {};

  async initialize() {
    if (this.initialized) return;

    try {
      // 문서 목록 초기화
      this.docs = [];
      
      const files = [
        'executive_summary.md',
        'project_plan.md',
        'execution_plan_timeline.md',
        'networking_partnership_strategy.md',
        'marketing_sales_strategy.md',
        'target_companies_list.md',
        'us_b2b_tech_market_trends.md',
        'company_profile.md'
      ];

      // 중복 방지를 위한 Set
      const processedIds = new Set<string>();
      
      for (const filename of files) {
        const id = filename.replace('.md', '');
        
        // 이미 처리된 ID인 경우 건너뜁니다
        if (processedIds.has(id)) {
          console.log(`Skipping duplicate document ID: ${id}`);
          continue;
        }
        
        // ID를 기록합니다
        processedIds.add(id);
        
        // 문서 내용을 가져옵니다
        try {
          const response = await fetch(`/${filename}`);
          if (response.ok) {
            let content = await response.text();
            
            // JSON 문자열인 경우 처리
            if (content.startsWith('"') && content.endsWith('"')) {
              try {
                content = JSON.parse(content);
                console.log(`Parsed JSON content for ${filename}`);
              } catch (err) {
                console.error(`Error parsing JSON content in ${filename}:`, err);
              }
            }
            
            // 이스케이프된 문자 처리
            content = this.unescapeString(content);
            
            // 로컬 스토리지에서 저장된 버전이 있는지 확인합니다
            const savedContent = typeof window !== 'undefined' 
              ? localStorage.getItem(`document_${id}`) 
              : null;
            
            // 제목 추출
            const title = filename
              .replace('.md', '')
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            // 저장된 버전이 있으면 그것을 사용하고, 없으면 원본을 사용합니다
            const finalContent = savedContent ? this.unescapeString(savedContent) : content;
            
            // 캐시에 저장
            this.documentCache[id] = finalContent;
            
            // 문서 추가
            this.docs.push({
              id,
              title,
              filename,
              content: finalContent
            });
          }
        } catch (error) {
          console.error(`Error loading document ${filename}:`, error);
        }
      }
      
      console.log(`Loaded ${this.docs.length} documents`);
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing documents:', error);
    }
  }

  // 이스케이프된 문자열을 원래 문자로 변환
  private unescapeString(str: string): string {
    if (typeof str !== 'string') return str;
    
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\');
  }

  async getAllDocuments(): Promise<Document[]> {
    if (!this.initialized) {
      await this.initialize();
    }
    return [...this.docs];
  }

  async getDocument(id: string): Promise<Document | undefined> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // 캐시된 내용 확인
    if (this.documentCache[id]) {
      const doc = this.docs.find(doc => doc.id === id);
      if (doc) {
        return {
          ...doc,
          content: this.documentCache[id]
        };
      }
    }
    
    return this.docs.find(doc => doc.id === id);
  }

  async saveDocument(id: string, content: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const docIndex = this.docs.findIndex(doc => doc.id === id);
    if (docIndex === -1) return false;
    
    // 이스케이프된 문자 처리
    const normalizedContent = this.unescapeString(content);
    
    // 메모리와 캐시 업데이트
    this.docs[docIndex].content = normalizedContent;
    this.documentCache[id] = normalizedContent;
    
    try {
      // 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem(`document_${id}`, normalizedContent);
        console.log(`Document ${id} saved to localStorage`);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      return false;
    }
  }

  // 캐시 삭제
  clearCache() {
    this.documentCache = {};
    this.initialized = false;
    console.log("Document cache cleared");
  }
}

export const documentService = new DocumentService(); 