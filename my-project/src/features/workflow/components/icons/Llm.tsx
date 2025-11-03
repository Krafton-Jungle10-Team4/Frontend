import * as React from 'react';
import data from './Llm.json';
import IconBase from '@/shared/components/icons/IconBase';
import type { IconData } from '@/shared/components/icons/IconBase';

const Llm = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

Llm.displayName = 'Llm';

export default Llm;
