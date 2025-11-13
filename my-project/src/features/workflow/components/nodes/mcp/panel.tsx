/**
 * MCP 노드 설정 패널
 *
 * 기존 MCPNodeConfig 컴포넌트 재사용
 */

import { BasePanel } from '../_base/base-panel';
import { MCPNodeConfig } from '../../NodeConfigPanel/configs/MCPNodeConfig';

export const MCPPanel = () => {
  return (
    <BasePanel>
      <MCPNodeConfig />
    </BasePanel>
  );
};
