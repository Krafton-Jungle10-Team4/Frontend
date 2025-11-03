import * as React from 'react';

export interface IconNode {
  type: string;
  name?: string;
  attributes?: Record<string, string>;
  children?: IconNode[];
}

export interface IconData {
  icon: IconNode;
  name: string;
}

interface IconBaseProps extends React.SVGProps<SVGSVGElement> {
  data: IconData;
  size?: number | string;
}

const IconBase = React.forwardRef<SVGSVGElement, IconBaseProps>(
  ({ data, size, ...props }, ref) => {
    const renderNode = (node: IconNode, index: number = 0): React.ReactNode => {
      if (!node || node.type !== 'element') return null;

      const { name, attributes = {}, children = [] } = node;

      if (!name) return null;

      const svgProps: Record<string, any> = {};

      // Convert attributes to React props
      Object.entries(attributes).forEach(([key, value]) => {
        const propName = key.replace(/-([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        svgProps[propName] = value;
      });

      // Override width and height if size is provided and this is the root svg
      if (name === 'svg' && size) {
        svgProps.width = size;
        svgProps.height = size;
      }

      // Create the element
      const element = React.createElement(
        name,
        {
          key: index,
          ...svgProps,
          ...(name === 'svg' ? { ref, ...props } : {}),
        },
        children.map((child, i) => renderNode(child, i))
      );

      return element;
    };

    if (!data || !data.icon) {
      return null;
    }

    return renderNode(data.icon) as React.ReactElement<SVGSVGElement>;
  }
);

IconBase.displayName = 'IconBase';

export default IconBase;
