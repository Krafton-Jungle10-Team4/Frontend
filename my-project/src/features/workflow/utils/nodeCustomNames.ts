/**
 * 노드 커스텀 이름 관리 유틸리티
 * 로컬 스토리지에 저장하여 백엔드에 영향을 주지 않고 프론트엔드에서만 관리
 */

const STORAGE_KEY_PREFIX = 'workflow_node_custom_names_';

/**
 * 봇별 노드 커스텀 이름을 가져오는 키 생성
 */
const getStorageKey = (botId: string): string => {
  return `${STORAGE_KEY_PREFIX}${botId}`;
};

/**
 * 노드 커스텀 이름 타입
 */
export type NodeCustomNames = Record<string, string>; // { nodeId: customName }

/**
 * 봇의 모든 노드 커스텀 이름 가져오기
 */
export const getNodeCustomNames = (botId: string | null): NodeCustomNames => {
  if (!botId) return {};

  try {
    const key = getStorageKey(botId);
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as NodeCustomNames) : {};
  } catch (error) {
    console.error('Failed to load node custom names:', error);
    return {};
  }
};

/**
 * 특정 노드의 커스텀 이름 가져오기
 */
export const getNodeCustomName = (
  botId: string | null,
  nodeId: string
): string | null => {
  const names = getNodeCustomNames(botId);
  return names[nodeId] || null;
};

/**
 * 노드 커스텀 이름 저장
 */
export const setNodeCustomName = (
  botId: string | null,
  nodeId: string,
  customName: string | null
): void => {
  if (!botId) return;

  try {
    const key = getStorageKey(botId);
    const current = getNodeCustomNames(botId);

    if (customName && customName.trim()) {
      // 커스텀 이름이 있으면 저장
      const updated = { ...current, [nodeId]: customName.trim() };
      localStorage.setItem(key, JSON.stringify(updated));
    } else {
      // 빈 문자열이면 삭제
      const { [nodeId]: removed, ...rest } = current;
      if (Object.keys(rest).length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(rest));
      }
    }
  } catch (error) {
    console.error('Failed to save node custom name:', error);
  }
};

/**
 * 노드 커스텀 이름 삭제
 */
export const removeNodeCustomName = (
  botId: string | null,
  nodeId: string
): void => {
  setNodeCustomName(botId, nodeId, null);
};

/**
 * 봇의 모든 노드 커스텀 이름 삭제
 */
export const clearNodeCustomNames = (botId: string | null): void => {
  if (!botId) return;

  try {
    const key = getStorageKey(botId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear node custom names:', error);
  }
};

