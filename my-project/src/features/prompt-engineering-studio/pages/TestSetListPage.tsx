import { Link } from 'react-router-dom';
import { mockTestSets } from '../data/mockTestSets';
import { TestSetCard } from '../components/TestSetCard';
import { StudioSidebar } from '../components/layouts/StudioSidebar';
import { History, ChevronRight } from 'lucide-react';

export function TestSetListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-white flex items-start">
      <StudioSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {/* Breadcrumb Navigation */}
            <div className="mb-4 flex items-center text-sm text-gray-400">
              <Link to="/prompt-studio" className="hover:text-white">프롬프트 스튜디오</Link>
              <ChevronRight className="mx-2 size-4" />
              <span className="font-semibold text-white">Test Sets 히스토리</span>
            </div>

            {/* Main Title Area */}
            <div className="flex items-start gap-4">
              <History className="size-10 text-cyan-300 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Test Sets 히스토리
                </h1>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl">
                  과거에 진행한 프롬프트 테스트의 결과를 검토하고 비교합니다.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockTestSets.map((ts) => (
              <TestSetCard key={ts.id} testSet={ts} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
