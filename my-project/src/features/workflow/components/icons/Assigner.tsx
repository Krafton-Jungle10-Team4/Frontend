import * as React from 'react';
import data from './Assigner.json';
import IconBase from '@/shared/components/icons/IconBase';
import type { IconData } from '@/shared/components/icons/IconBase';

const Assigner = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

Assigner.displayName = 'Assigner';

export default Assigner;
