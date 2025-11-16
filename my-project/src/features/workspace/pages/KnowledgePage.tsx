export function KnowledgePage() {
  return (
    <div className="flex h-full overflow-hidden bg-muted/30 p-6">
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-background p-6 border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">지식</h1>
          <p className="text-muted-foreground">
            지식 베이스를 관리하고 문서를 업로드하세요.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            지식 페이지
          </p>
        </div>
      </div>
    </div>
  );
}
