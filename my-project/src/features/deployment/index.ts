/**
 * Deployment Feature Public API
 * Deployment Feature의 모든 공개 API를 정의
 */

// ============= API =============
export { deploymentApi } from './api/deploymentApi.ts';

// ============= Store =============
export { useDeploymentStore } from './stores/deploymentStore.ts';
export {
  selectDeployment,
  selectIsLoading,
  selectError,
  selectIsEmbedDialogOpen,
  selectIsApiDialogOpen,
  selectWidgetConfig,
  selectEmbedScript,
  selectWidgetKey,
  selectDeploymentStatus,
} from './stores/deploymentStore.ts';

// ============= Types =============
export type {
  WidgetConfig,
  DeploymentStatus,
  Deployment,
  DeploymentCreateRequest,
  DeploymentStatusUpdateRequest,
  DeploymentStatusUpdateResponse,
  DeploymentDeleteResponse,
  DeploymentState,
} from './types/deployment.ts';
export {
  isDeployment,
  isDeploymentStatus,
  DEPLOYMENT_STATUS_LABELS,
  DEPLOYMENT_STATUS_COLORS,
} from './types/deployment.ts';

// ============= Components =============
export { EmbedCodeDisplay } from './components/EmbedCodeDisplay.tsx';
export { EmbedWebsiteDialog } from './components/EmbedWebsiteDialog.tsx';
export { ApiReferenceDialog } from './components/ApiReferenceDialog.tsx';
export { DeploymentManager } from './components/DeploymentManager.tsx';
export { EnvVarsEditor } from './components/EnvVarsEditor.tsx';

// ============= Pages =============
export { DeploymentPage } from './pages/DeploymentPage.tsx';
