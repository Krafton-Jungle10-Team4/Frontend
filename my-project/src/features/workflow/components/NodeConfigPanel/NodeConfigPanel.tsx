/**
 * 노드 설정 패널 라우터
 *
 * 선택된 노드 타입에 따라 적절한 Panel 컴포넌트를 동적으로 로드
 */

import { useWorkflowStore } from '../../stores/workflowStore';
import { PanelComponentMap } from '../nodes/components';

export const NodeConfigPanel = () => {
  const { selectedNodeId, nodes } = useWorkflowStore();

  // 노드가 선택되지 않은 경우
  if (!selectedNodeId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        노드를 선택하세요
      </div>
    );
  }

  const node = nodes.find((n) => n.id === selectedNodeId);

  // 노드를 찾을 수 없는 경우
  if (!node) {
    return null;
  }

  // 노드 타입에 맞는 Panel 컴포넌트 가져오기
  const PanelComponent = PanelComponentMap[node.data.type];

  // Panel 컴포넌트가 없는 경우 (Start, End 노드)
  if (!PanelComponent) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        이 노드는 설정이 필요하지 않습니다
      </div>
    );
  }

  // 동적으로 Panel 컴포넌트 렌더링
  return <PanelComponent data={node.data} />;
};
