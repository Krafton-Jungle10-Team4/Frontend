/**
 * 템플릿 파일 핸들러 유틸리티
 */
import { saveAs } from 'file-saver';
import type { WorkflowTemplate } from '../types/template.types';
import {
  TEMPLATE_FILE_EXTENSION,
  TEMPLATE_MIME_TYPE,
} from '../constants/templateDefaults';

/**
 * 템플릿을 JSON 파일로 다운로드
 */
export async function downloadTemplateAsFile(
  template: WorkflowTemplate
): Promise<void> {
  try {
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: TEMPLATE_MIME_TYPE });
    const filename = `template_${template.name}_${template.version}${TEMPLATE_FILE_EXTENSION}`;

    saveAs(blob, filename);
  } catch (error) {
    console.error('템플릿 다운로드 실패:', error);
    throw new Error('템플릿 파일 다운로드에 실패했습니다.');
  }
}

/**
 * 파일에서 템플릿 읽기
 */
export async function readTemplateFromFile(
  file: File
): Promise<WorkflowTemplate> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith(TEMPLATE_FILE_EXTENSION)) {
      reject(new Error('JSON 파일만 업로드 가능합니다.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const template = JSON.parse(text) as WorkflowTemplate;
        resolve(template);
      } catch (error) {
        reject(new Error('유효하지 않은 JSON 파일입니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다.'));
    };

    reader.readAsText(file);
  });
}

/**
 * 템플릿 JSON 복사 (클립보드)
 */
export async function copyTemplateToClipboard(
  template: WorkflowTemplate
): Promise<void> {
  try {
    const json = JSON.stringify(template, null, 2);
    await navigator.clipboard.writeText(json);
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    throw new Error('클립보드 복사에 실패했습니다.');
  }
}
