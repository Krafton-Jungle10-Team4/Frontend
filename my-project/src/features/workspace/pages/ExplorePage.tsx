export function ExplorePage() {
  return (
    <div className="flex h-full overflow-hidden bg-muted/30 p-6">
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-background p-6 border border-gray-200/60 shadow-sm transition-all duration-200 hover:border-gray-300/80 hover:shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">SnapAgent로 앱 탐색</h1>
          <p className="text-muted-foreground">
            이 템플릿을 즉시 사용하거나 템플릿을 기반으로 고유한 앱을
            사용하세요.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            탐색 페이지
          </p>
        </div>
      </div>
    </div>
  );
}
