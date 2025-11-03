import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export type SidebarView = 'flow' | 'monitoring' | 'logs';

export interface WorkflowSidebarProps {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

/**
 * 워크플로우 빌더 왼쪽 사이드바 네비게이션
 * Dify 스타일의 메뉴 구조
 */
const WorkflowSidebar = ({
  activeView,
  onViewChange,
}: WorkflowSidebarProps) => {
  const navigate = useNavigate();

  const menuItems: { id: SidebarView; label: string; icon: string }[] = [
    { id: 'flow', label: '플로우', icon: '🔀' },
    { id: 'monitoring', label: '모니터링', icon: '📊' },
    { id: 'logs', label: '로그 & 어노테이션', icon: '📝' },
  ];

  const handleHomeClick = () => {
    // 로그인된 사용자의 홈 화면 (봇 목록)으로 이동
    navigate('/home');
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Workflow Builder
        </h2>
      </div>

      {/* 메뉴 리스트 */}
      <nav className="flex-1 p-2">
        {/* 홈 버튼 */}
        <button
          onClick={handleHomeClick}
          className="
            w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2
            transition-colors duration-150
            text-gray-700 hover:bg-gray-50
          "
        >
          <Home size={20} className="text-gray-600" />
          <span className="text-sm">홈</span>
        </button>

        {/* 구분선 */}
        <div className="border-t border-gray-200 my-2" />

        {/* 기존 메뉴 항목들 */}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1
              transition-colors duration-150
              ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 하단 정보 */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>워크플로우 상태</p>
          <p className="mt-1 text-green-600">● 실행 중</p>
        </div>
      </div>
    </div>
  );
};

export default memo(WorkflowSidebar);
