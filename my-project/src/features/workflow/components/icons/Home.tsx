import * as React from 'react';
import data from './Home.json';
import IconBase from '@/shared/components/icons/IconBase';
import type { IconData } from '@/shared/components/icons/IconBase';

const Home = (
  props: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  }
) => <IconBase {...props} data={data as IconData} />;

Home.displayName = 'Home';

export default Home;
