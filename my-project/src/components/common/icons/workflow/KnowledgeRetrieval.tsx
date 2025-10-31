import * as React from 'react';
import data from './KnowledgeRetrieval.json';
import IconBase from '../IconBase';
import type { IconData } from '../IconBase';

const KnowledgeRetrieval = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

KnowledgeRetrieval.displayName = 'KnowledgeRetrieval';

export default KnowledgeRetrieval;