/**
 * Shared Layer
 * Public API
 */

// API
export { apiClient } from './api/client';

// Types
export type {
  Language,
  ViewMode,
  AsyncState,
  ApiResponse,
  GoalType,
  DescriptionSource,
  User,
} from './types';

// Utils
export {
  validateFile,
  getFileExtension,
  formatFileSize,
  isAllowedExtension,
  isFileSizeValid,
  FILE_VALIDATION,
} from './utils/fileValidation';
export type {
  AllowedExtension,
  FileValidationResult,
  FileValidationError,
  FileValidationSuccess,
} from './utils/fileValidation';

// Utils are exported from their respective files
// Constants are exported from their respective files
