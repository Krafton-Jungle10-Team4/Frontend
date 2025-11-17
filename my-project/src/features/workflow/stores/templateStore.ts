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
import { PortType } from '@/shared/types/workflow/port.types';
import type { PortDefinition as WorkflowPortDefinition } from '@/shared/types/workflow/port.types';
import { toast } from 'sonner';

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
  };

  return {
    name: port.name,
    type: typeMap[port.type] || PortType.ANY,
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
  validateExport: (graph: { nodes: Node[]; edges: any[] }) => Promise<void>;
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
      validateExport: async (graph) => {
        set({ isLoading: true, error: null });
        try {
          const validation = await templateApi.validateExport(graph);
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
          // 템플릿 조회
          const template = await templateApi.get(templateId);

          // ImportedWorkflowNode 생성
          // Note: 'imported-workflow'는 아직 BlockEnum에 없으므로 문자열 리터럴 사용
          const nodeId = `imported_${template.id}_${Date.now()}`;
          const node: Node<{
            template_id: string;
            template_name: string;
            template_version: string;
            is_expanded: boolean;
            read_only: boolean;
            internal_graph: typeof template.graph;
          }> = {
            id: nodeId,
            type: 'imported-workflow',
            position,
            data: {
              type: 'imported-workflow' as any, // BlockEnum에 ImportedWorkflow 추가 전까지 임시
              title: template.name,
              desc: template.description,
              template_id: template.id,
              template_name: template.name,
              template_version: template.version,
              is_expanded: false,
              read_only: true,
              internal_graph: template.graph,
              ports: {
                inputs: template.input_schema.map(convertPortDefinition),
                outputs: template.output_schema.map(convertPortDefinition),
              },
              variable_mappings: {},
            },
          };

          // workflowStore에 노드 추가
          const workflowStore = useWorkflowStore.getState();
          workflowStore.addNode(node);

          // 사용 기록
          try {
            await templateApi.recordUsage(templateId, {
              workflow_id: workflowStore.botId || 'unknown',
              node_id: nodeId,
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

          return nodeId;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || '템플릿 Import 실패';
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
