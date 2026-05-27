import { Flexbox } from '@lobehub/ui';

import Browser from './Browser';
import Files from './Files';
import Plugins from './Plugins';

const Home = () => {
  return (
    <Flexbox gap={12} height={'100%'}>
      <Browser />
      <Files />
      <Plugins />
    </Flexbox>
  );
};

export default Home;
