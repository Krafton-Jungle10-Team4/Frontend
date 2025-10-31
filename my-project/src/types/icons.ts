/**
 * Abstract representation of an SVG element node
 * Used for JSON-based icon system
 */
export type AbstractNode = {
  name: string;
  attributes: {
    [key: string]: string | undefined;
  };
  children?: AbstractNode[];
};

/**
 * Icon data structure containing name and SVG definition
 */
export type IconData = {
  name: string;
  icon: AbstractNode;
};

/**
 * Normalized attributes for React elements
 */
export type Attrs = {
  [key: string]: string | undefined;
};
