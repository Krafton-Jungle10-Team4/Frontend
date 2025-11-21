import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlow, Background, ReactFlowProvider, Controls, type NodeTypes, type EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowLeft, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/button';
import { Badge } from '@/shared/components/badge';
import CustomNode from '../components/nodes';
import CustomEdge from '../components/edges/custom-edge';
import { ImportedWorkflowNode } from '../components/nodes/imported-workflow/node';
import { templateApi } from '../api/templateApi';
import type { Node, Edge } from '@/shared/types/workflow.types';
import type { WorkflowTemplate } from '../types/template.types';
import { TopNavigation } from '@/widgets';
import { useAuthStore } from '@/features/auth';
import { useUIStore } from '@/shared/stores/uiStore';

const REACT_FLOW_NODE_TYPES = {
  custom: CustomNode,
  'imported-workflow': ImportedWorkflowNode,
} as NodeTypes;

const REACT_FLOW_EDGE_TYPES: EdgeTypes = {
  custom: CustomEdge,
};

const TemplatePreviewInner = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        toast.error('템플릿 ID가 없습니다');
        navigate(-1);
        return;
      }

      try {
        setLoading(true);
        const templateData = await templateApi.get(templateId);
        setTemplate(templateData);

        if (templateData.graph?.nodes && templateData.graph?.edges) {
          setNodes(templateData.graph.nodes as Node[]);
          setEdges(templateData.graph.edges as Edge[]);
        } else {
          toast.error('템플릿 데이터가 유효하지 않습니다');
        }
      } catch (error) {
        console.error('Failed to load template:', error);
        toast.error('템플릿을 불러오는데 실패했습니다');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">템플릿을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={REACT_FLOW_NODE_TYPES}
        edgeTypes={REACT_FLOW_EDGE_TYPES}
        fitView
        nodesConnectable={false}
        nodesDraggable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        className="bg-gray-50"
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>

      {/* 읽기 전용 배너 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">읽기 전용 모드</span>
          {template && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-2" />
              <span className="text-sm text-muted-foreground">
                {template.name}
              </span>
              <Badge variant="outline" className="ml-1">
                v{template.version}
              </Badge>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const TemplatePreviewPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const language = useUIStore((state) => state.language);
  const setLanguage = useUIStore((state) => state.setLanguage);

  const handleLogout = async () => {
    try {
      useAuthStore.getState().reset();
      navigate('/landing');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation
        onToggleSidebar={() => {}}
        userName={userName}
        userEmail={userEmail}
        onHomeClick={() => navigate('/workspace/studio')}
        language={language}
        onLanguageChange={setLanguage}
        onLogout={handleLogout}
      />

      {/* 뒤로 가기 버튼 */}
      <div className="px-6 py-3 border-b bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로 가기
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <TemplatePreviewInner />
        </ReactFlowProvider>
      </div>
    </div>
  );
};
