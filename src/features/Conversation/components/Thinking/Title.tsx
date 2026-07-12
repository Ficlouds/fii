import { Flexbox } from '@lobehub/ui';
import { memo, useEffect, useRef, useState } from 'react';

import { shinyTextStyles } from '@/styles';

import StatusIndicator from './StatusIndicator';

interface ThinkingTitleProps {
  duration?: number;
  showDetail?: boolean;
  thinking?: boolean;
}

const FI_THINKING_WORDS = [
  'Feeling',
  'Sensing',
  'Absorbing',
  'Noticing',
  'Listening',
  'Tuning in',
  'Attuning',
  'Resonating',
  'Empathising',
  'Attending',
  'Intuiting',
  'Inhabiting',
  'Sitting with this',
  'Perceiving',
  'Thinking',
  'Reflecting',
  'Considering',
  'Pondering',
  'Mulling',
  'Deliberating',
  'Weighing',
  'Reckoning',
  'Discerning',
  'Sifting',
  'Untangling',
  'Unpacking',
  'Unravelling',
  'Parsing',
  'Deciphering',
  'Scrutinising',
  'Examining',
  'Appraising',
  'Brewing',
  'Simmering',
  'Steeping',
  'Marinating',
  'Percolating',
  'Infusing',
  'Distilling',
  'Fermenting',
  'Ripening',
  'Mellowing',
  'Crystallising',
  'Settling',
  'Tempering',
  'Reducing',
  'Blending',
  'Germinating',
  'Growing',
  'Rooting',
  'Unfurling',
  'Branching',
  'Sprouting',
  'Budding',
  'Rippling',
  'Flowing',
  'Ebbing',
  'Drifting',
  'Weathering',
  'Blossoming',
  'Wandering',
  'Meandering',
  'Navigating',
  'Tracing',
  'Threading',
  'Weaving',
  'Mapping',
  'Exploring',
  'Circling',
  'Spiralling',
  'Orbiting',
  'Winding',
  'Ambling',
  'Moseying',
  'Roaming',
  'Remembering',
  'Connecting',
  'Piecing together',
  'Retrieving',
  'Recalling',
  'Stitching',
  'Linking',
  'Anchoring',
  'Gathering',
  'Assembling',
  'Coalescing',
  'Synthesising',
  'Integrating',
  'Harmonising',
  'Triangulating',
  'Cross-referencing',
  'Frolicking',
  'Gallivanting',
  'Doodling',
  'Noodling',
  'Lollygagging',
  'Dilly-dallying',
  'Puttering',
  'Tinkering',
  'Wibbling',
  'Shimmying',
  'Zigzagging',
  'Swirling',
  'Waltzing',
  'Scampering',
  'Dawdling',
  'Pottering',
  'Traipsing',
  'Bimbling',
  'Sauntering',
  'Faffing',
  'Crafting',
  'Shaping',
  'Sculpting',
  'Forging',
  'Composing',
  'Sketching',
  'Rendering',
  'Painting',
  'Carving',
  'Knitting',
  'Embroidering',
  'Etching',
  'Drafting',
  'Moulding',
  'Philosophising',
  'Ruminating',
  'Cogitating',
  'Contemplating',
  'Musing',
  'Daydreaming',
  'Woolgathering',
  'Stargazing',
  'Chin-stroking',
  'Headscratching',
  'Brow-furrowing',
  'Fi-ing',
  'Being here',
  'Showing up',
  'Remembering you',
];

const FI_SYMBOLS = [
  '♡',
  '◌',
  '∿',
  '⟡',
  '✦',
  '◈',
  '⋯',
  '∘',
  '◇',
  '⬡',
  '✧',
  '◐',
  '∾',
  '⊙',
  '⟢',
  '❋',
  '◍',
  '⟣',
  '⬟',
  '✩',
];

const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const ThinkingTitle = memo<ThinkingTitleProps>(({ showDetail, thinking }) => {
  const [display, setDisplay] = useState({
    word: getRandom(FI_THINKING_WORDS),
    symbol: getRandom(FI_SYMBOLS),
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (thinking) {
      // Pick fresh on start
      setDisplay({
        word: getRandom(FI_THINKING_WORDS),
        symbol: getRandom(FI_SYMBOLS),
      });
      // Rotate every 2 seconds
      intervalRef.current = setInterval(() => {
        setDisplay({
          word: getRandom(FI_THINKING_WORDS),
          symbol: getRandom(FI_SYMBOLS),
        });
      }, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [thinking]);

  return (
    <Flexbox horizontal align={'center'} gap={6}>
      <StatusIndicator showDetail={showDetail} thinking={thinking} />
      {thinking && (
        <span className={shinyTextStyles.shinyText}>
          {display.symbol} {display.word}
        </span>
      )}
    </Flexbox>
  );
});

ThinkingTitle.displayName = 'ThinkingTitle';

export default ThinkingTitle;
