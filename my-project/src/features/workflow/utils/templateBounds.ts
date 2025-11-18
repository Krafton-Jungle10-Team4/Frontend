export type TemplateGraphBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  contentWidth: number;
  contentHeight: number;
};

const DEFAULT_MIN_WIDTH = 600;
const DEFAULT_MIN_HEIGHT = 400;
const BOUNDING_PADDING = 80;
const DEFAULT_NODE_WIDTH = 240;
const DEFAULT_NODE_HEIGHT = 100;

/**
 * 템플릿 내부 그래프의 바운딩 정보를 계산한다.
 * - 그래프 외곽을 기준으로 컨테이너 크기 및 오프셋을 산출
 * - 노드가 없을 때는 기본 크기를 반환
 */
export const calculateTemplateGraphBounds = (
  nodes: any[] | undefined,
  options?: {
    padding?: number;
    minWidth?: number;
    minHeight?: number;
    defaultNodeWidth?: number;
    defaultNodeHeight?: number;
  }
): TemplateGraphBounds => {
  const padding = options?.padding ?? BOUNDING_PADDING;
  const minWidth = options?.minWidth ?? DEFAULT_MIN_WIDTH;
  const minHeight = options?.minHeight ?? DEFAULT_MIN_HEIGHT;
  const nodeWidth = options?.defaultNodeWidth ?? DEFAULT_NODE_WIDTH;
  const nodeHeight = options?.defaultNodeHeight ?? DEFAULT_NODE_HEIGHT;

  if (!nodes || nodes.length === 0) {
    return {
      minX: 0,
      maxX: minWidth,
      minY: 0,
      maxY: minHeight,
      width: minWidth,
      height: minHeight,
      offsetX: padding,
      offsetY: padding,
      contentWidth: minWidth,
      contentHeight: minHeight,
    };
  }

  const minX = Math.min(...nodes.map((node: any) => node.position?.x ?? 0));
  const maxX = Math.max(
    ...nodes.map(
      (node: any) => (node.position?.x ?? 0) + (node.style?.width ?? nodeWidth)
    )
  );
  const minY = Math.min(...nodes.map((node: any) => node.position?.y ?? 0));
  const maxY = Math.max(
    ...nodes.map(
      (node: any) => (node.position?.y ?? 0) + (node.style?.height ?? nodeHeight)
    )
  );

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;
  const width = Math.max(minWidth, contentWidth + padding * 2);
  const height = Math.max(minHeight, contentHeight + padding * 2);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    offsetX: padding - minX,
    offsetY: padding - minY,
    contentWidth,
    contentHeight,
  };
};

export const TEMPLATE_HEADER_OFFSET = 100;
