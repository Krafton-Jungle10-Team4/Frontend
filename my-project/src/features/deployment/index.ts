/**
 * Deployment Feature Public API
 * Deployment Feature의 모든 공개 API를 정의
 */

// ============= API =============
export { deploymentApi } from './api/deploymentApi';

// ============= Store =============
export { useDeploymentStore } from './stores/deploymentStore';
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
} from './stores/deploymentStore';

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
} from './types/deployment';
export {
  isDeployment,
  isDeploymentStatus,
  DEPLOYMENT_STATUS_LABELS,
  DEPLOYMENT_STATUS_COLORS,
} from './types/deployment';

// ============= Pages =============
export { DeploymentPage } from './pages/DeploymentPage';
