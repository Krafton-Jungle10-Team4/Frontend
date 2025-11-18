/**
 * 템플릿 상태 관리 (Zustand)
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  WorkflowTemplate,
  WorkflowTemplateSummary,
  ExportValidation,
  ImportValidation,
  ExportConfig,
  PortDefinition as TemplatePortDefinition,
} from '../types/template.types';
import { templateApi } from '../api/templateApi';
import { downloadTemplateAsFile } from '../api/fileHandler';
import { useWorkflowStore } from './workflowStore';
import type { Node } from '@/shared/types/workflow.types';
import { BlockEnum } from '@/shared/types/workflow.types';
import { PortType } from '@/shared/types/workflow/port.types';
import type { PortDefinition as WorkflowPortDefinition } from '@/shared/types/workflow/port.types';
import { toast } from 'sonner';
import { createImportedNodeFromTemplate } from '../utils/templateImporter';
import { validateTemplate } from '../utils/templateValidator';

/**
 * 템플릿 포트 정의를 워크플로우 포트 정의로 변환
 */
const convertPortDefinition = (
  port: TemplatePortDefinition
): WorkflowPortDefinition => {
  // 타입 매핑
  const typeMap: Record<string, PortType> = {
    string: PortType.STRING,
    number: PortType.NUMBER,
    boolean: PortType.BOOLEAN,
    array: PortType.ARRAY,
    object: PortType.OBJECT,
    any: PortType.ANY,
    file: PortType.FILE,
    array_file: PortType.ARRAY_FILE,
  };

  const mappedType = typeMap[port.type];

  if (!mappedType) {
    console.warn(`Unknown port type "${port.type}" for port "${port.name}", defaulting to ANY`);
    return {
      name: port.name,
      type: PortType.ANY,
      required: port.required,
      description: port.description || '',
      display_name: port.display_name || port.name,
      default_value: port.default_value,
    };
  }

  return {
    name: port.name,
    type: mappedType,
    required: port.required,
    description: port.description || '',
    display_name: port.display_name || port.name,
    default_value: port.default_value,
  };
};

interface TemplateState {
  // State
  templates: WorkflowTemplateSummary[];
  currentTemplate: WorkflowTemplate | null;
  isLoading: boolean;
  error: string | null;

  // Export state
  isExportDialogOpen: boolean;
  exportValidation: ExportValidation | null;

  // Import state
  isImportDialogOpen: boolean;
  importValidation: ImportValidation | null;

  // Actions
  loadTemplates: (filters?: {
    visibility?: string;
    category?: string;
    search?: string;
    tags?: string[];
    author_id?: string;
    sort_by?: string;
    sort_order?: string;
    skip?: number;
    limit?: number;
  }) => Promise<void>;
  loadTemplate: (templateId: string) => Promise<void>;

  // Export actions
  openExportDialog: () => void;
  closeExportDialog: () => void;
  validateExport: () => Promise<void>;
  exportTemplate: (config: ExportConfig) => Promise<WorkflowTemplate>;

  // Import actions
  openImportDialog: () => void;
  closeImportDialog: () => void;
  validateImport: (templateId: string) => Promise<void>;
  importTemplate: (
    templateId: string,
    position: { x: number; y: number }
  ) => Promise<string>;

  // File operations
  downloadTemplate: (templateId: string) => Promise<void>;
  uploadTemplate: (file: File) => Promise<void>;

  // Management
  deleteTemplate: (templateId: string) => Promise<void>;
  updateTemplate: (
    templateId: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: 'private' | 'team' | 'public';
    }
  ) => Promise<void>;

  // Reset
  reset: () => void;
}

export const useTemplateStore = create<TemplateState>()(
  devtools(
    (set, get) => ({
      // Initial state
      templates: [],
      currentTemplate: null,
      isLoading: false,
      error: null,
      isExportDialogOpen: false,
      isImportDialogOpen: false,
      exportValidation: null,
      importValidation: null,

      // Load templates
      loadTemplates: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await templateApi.list(filters);
          set({ templates: response.templates, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 목록 조회 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Load single template
      loadTemplate: async (templateId) => {
        set({ isLoading: true, error: null });
        try {
          const template = await templateApi.get(templateId);
          set({ currentTemplate: template, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 조회 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Export dialog
      openExportDialog: () => set({ isExportDialogOpen: true }),
      closeExportDialog: () =>
        set({ isExportDialogOpen: false, exportValidation: null }),

      // Validate export
      validateExport: async () => {
        set({ isLoading: true, error: null });
        try {
          // Get live nodes and edges from workflow store
          const workflowStore = useWorkflowStore.getState();
          const { nodes, edges, botId, draftVersionId } = workflowStore;

          if (!botId || !draftVersionId) {
            const errorMessage = '워크플로우를 먼저 저장해주세요.';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            return;
          }

          const validation = await templateApi.validateExport(
            { nodes, edges },
            { workflow_id: botId, version_id: draftVersionId }
          );
          set({ exportValidation: validation, isLoading: false });

          if (!validation.is_valid) {
            toast.error('Export 검증 실패', {
              description: validation.errors.join(', '),
            });
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Export 검증 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Export template
      exportTemplate: async (config) => {
        set({ isLoading: true, error: null });
        try {
          // API는 TemplateOperationResult만 반환하므로 전체 템플릿 조회 필요
          const result = await templateApi.export(config);

          // 생성된 템플릿의 전체 정보 조회
          const template = await templateApi.get(result.id);

          const { templates } = get();
          set({
            templates: [...templates, template],
            currentTemplate: template,
            isLoading: false,
            isExportDialogOpen: false,
          });

          toast.success('템플릿이 생성되었습니다.', {
            description: template.name,
          });

          return template;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 Export 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Import dialog
      openImportDialog: () => set({ isImportDialogOpen: true }),
      closeImportDialog: () =>
        set({ isImportDialogOpen: false, importValidation: null }),

      // Validate import
      validateImport: async (templateId) => {
        set({ isLoading: true, error: null });
        try {
          const validation = await templateApi.validateImport(templateId);
          set({ importValidation: validation, isLoading: false });

          if (!validation.is_valid) {
            toast.error('Import 검증 실패', {
              description: validation.errors.join(', '),
            });
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 'Import 검증 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Import template as node
      importTemplate: async (templateId, position) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🚀 [importTemplate] Starting template import:', { templateId, position });

          // 1. Import 검증 먼저 수행 (백엔드 API 호출)
          const validation = await templateApi.validateImport(templateId);

          // 2. 검증 실패 시 중단
          if (!validation.is_valid || !validation.is_compatible) {
            const errorMessages = [
              ...validation.errors,
              ...(validation.missing_node_types.length > 0
                ? [`호환되지 않는 노드 타입: ${validation.missing_node_types.join(', ')}`]
                : []),
            ];

            set({ isLoading: false });
            toast.error('템플릿 Import 불가', {
              description: errorMessages.join('. '),
            });
            throw new Error(errorMessages.join('. '));
          }

          // 3. 경고가 있으면 사용자에게 표시
          if (validation.warnings.length > 0) {
            toast.warning('Import 경고', {
              description: validation.warnings.join('. '),
            });
          }

          // 4. 템플릿 조회 (디버그 로깅 포함)
          const template = await templateApi.get(templateId);

          // 5. 프론트엔드 검증 (validateTemplate) - 구조, 노드 타입, 비즈니스 규칙
          console.log('🔍 [importTemplate] Running frontend template validation');
          const frontendValidation = validateTemplate(template);

          if (!frontendValidation.valid) {
            const errorMessage = `템플릿 검증 실패: ${frontendValidation.errors.join(', ')}`;
            console.error('❌ [importTemplate] Frontend validation failed:', {
              errors: frontendValidation.errors,
              template: {
                id: template.id,
                name: template.name,
                hasGraph: !!template.graph,
                hasNodes: !!template.graph?.nodes,
                hasEdges: !!template.graph?.edges,
                nodeTypes: template.graph?.nodes?.map((n: any) => n.data?.type) || []
              }
            });

            set({ isLoading: false });
            toast.error('템플릿 Import 불가', {
              description: errorMessage,
            });
            throw new Error(errorMessage);
          }

          console.log('✅ [importTemplate] Frontend validation passed');

          // 6. createImportedNodeFromTemplate 유틸리티 사용 (계획서 준수)
          console.log('🔧 [importTemplate] Creating imported node from template');
          const { node, childNodes, childEdges } = createImportedNodeFromTemplate(
            template,
            position,
            false // 초기에는 collapsed 상태
          );

          console.log('✅ [importTemplate] Node created successfully:', {
            nodeId: node.id,
            childNodesCount: childNodes.length,
            childEdgesCount: childEdges.length,
            hasInternalGraph: !!(node.data as any)?.internal_graph,
            internalGraphStructure: (node.data as any)?.internal_graph ? {
              nodesCount: (node.data as any).internal_graph.nodes?.length || 0,
              edgesCount: (node.data as any).internal_graph.edges?.length || 0
            } : null
          });

          // 7. workflowStore에 노드 추가
          const workflowStore = useWorkflowStore.getState();
          workflowStore.addNode(node);

          console.log('✅ [importTemplate] Node added to workflow');

          // 8. 사용 기록
          try {
            await templateApi.recordUsage(templateId, {
              workflow_id: workflowStore.botId || 'unknown',
              node_id: node.id,
              event_type: 'imported',
            });
          } catch (usageError) {
            // 사용 기록 실패는 무시 (주요 기능은 아님)
            console.warn('Failed to record template usage:', usageError);
          }

          set({ isLoading: false, isImportDialogOpen: false });
          toast.success('템플릿을 가져왔습니다.', {
            description: template.name,
          });

          console.log('🎉 [importTemplate] Template import completed successfully');
          return node.id;
        } catch (error: any) {
          console.error('❌ [importTemplate] Import failed:', error);
          const errorMessage =
            error.response?.data?.message || error.message || '템플릿 Import 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Download template
      downloadTemplate: async (templateId) => {
        try {
          const template = await templateApi.get(templateId);
          await downloadTemplateAsFile(template);
          toast.success('템플릿 다운로드 완료');
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 다운로드 실패';
          toast.error(errorMessage);
          throw error;
        }
      },

      // Upload template
      uploadTemplate: async (file) => {
        set({ isLoading: true, error: null });
        try {
          // API는 TemplateOperationResult만 반환하므로 전체 템플릿 조회 필요
          const result = await templateApi.upload(file);

          // 업로드된 템플릿의 전체 정보 조회
          const template = await templateApi.get(result.id);

          const { templates } = get();
          set({
            templates: [...templates, template],
            isLoading: false,
          });

          toast.success('템플릿을 업로드했습니다.', {
            description: template.name,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 업로드 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Delete template
      deleteTemplate: async (templateId) => {
        set({ isLoading: true, error: null });
        try {
          await templateApi.delete(templateId);
          const { templates } = get();
          set({
            templates: templates.filter((t) => t.id !== templateId),
            isLoading: false,
          });
          toast.success('템플릿을 삭제했습니다.');
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 삭제 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Update template
      updateTemplate: async (templateId, updates) => {
        set({ isLoading: true, error: null });
        try {
          // API는 TemplateOperationResult만 반환하므로 전체 템플릿 조회 필요
          await templateApi.update(templateId, updates);

          // 업데이트된 템플릿의 전체 정보 조회
          const updated = await templateApi.get(templateId);

          const { templates } = get();
          set({
            templates: templates.map((t) =>
              t.id === templateId ? updated : t
            ),
            isLoading: false,
          });
          toast.success('템플릿을 업데이트했습니다.');
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 업데이트 실패';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Reset state
      reset: () =>
        set({
          templates: [],
          currentTemplate: null,
          isLoading: false,
          error: null,
          isExportDialogOpen: false,
          isImportDialogOpen: false,
          exportValidation: null,
          importValidation: null,
        }),
    }),
    { name: 'template-store' }
  )
);
