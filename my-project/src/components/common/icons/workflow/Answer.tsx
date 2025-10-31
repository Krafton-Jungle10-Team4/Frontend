import * as React from 'react';
import data from './Answer.json';
import IconBase from '../IconBase';
import type { IconData } from '../IconBase';

const Answer = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

Answer.displayName = 'Answer';

export default Answer;
