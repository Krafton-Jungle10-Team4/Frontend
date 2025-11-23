import * as React from 'react';
import data from './Slack.json';
import IconBase from '@/shared/components/icons/IconBase';
import type { IconData } from '@/shared/components/icons/IconBase';

const Slack = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

Slack.displayName = 'Slack';

export default Slack;
