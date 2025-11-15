import * as React from 'react';
import data from './QuestionClassifier.json';
import IconBase from '@/shared/components/icons/IconBase';
import type { IconData } from '@/shared/components/icons/IconBase';

const QuestionClassifier = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

QuestionClassifier.displayName = 'QuestionClassifier';

export default QuestionClassifier;
