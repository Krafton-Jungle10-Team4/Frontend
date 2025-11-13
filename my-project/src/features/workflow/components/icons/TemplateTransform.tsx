import * as React from 'react';
import data from './TemplateTransform.json';
import IconBase from '@/shared/components/icons/IconBase';
import type { IconData } from '@/shared/components/icons/IconBase';

const TemplateTransform = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

TemplateTransform.displayName = 'TemplateTransform';

export default TemplateTransform;
