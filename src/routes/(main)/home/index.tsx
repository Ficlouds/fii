import { Flexbox } from '@lobehub/ui';
import { type FC } from 'react';

import HomePageTracker from '@/components/Analytics/HomePageTracker';

import HomeContent from './features';

const Home: FC = () => {
  return (
    <>
      <HomePageTracker />
      <Flexbox
        flex={1}
        height={'100%'}
        style={{ minHeight: 0, overflow: 'hidden' }}
        width={'100%'}
      >
        <HomeContent />
      </Flexbox>
    </>
  );
};

export default Home;
