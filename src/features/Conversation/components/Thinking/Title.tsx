import { Flexbox } from '@lobehub/ui';
import { memo, useEffect, useRef } from 'react';

import { shinyTextStyles } from '@/styles';

import StatusIndicator from './StatusIndicator';

interface ThinkingTitleProps {
  duration?: number;
  showDetail?: boolean;
  thinking?: boolean;
}

const FI_THINKING_WORDS = [
  // Feeling
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
  // Thinking
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
  // Cooking / patience
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
  // Nature
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
  // Movement
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
  // Memory & connection
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
  // Playful
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
  // Crafting
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
  // Deep thinking
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
  // Unique to Fi
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
  const wordRef = useRef<string>(getRandom(FI_THINKING_WORDS));
  const symbolRef = useRef<string>(getRandom(FI_SYMBOLS));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevThinkingRef = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (thinking && !prevThinkingRef.current) {
      // Pick fresh word + symbol when thinking starts
      wordRef.current = getRandom(FI_THINKING_WORDS);
      symbolRef.current = getRandom(FI_SYMBOLS);
    }
    prevThinkingRef.current = thinking;
  }, [thinking]);

  useEffect(() => {
    if (thinking) {
      // Rotate word + symbol every 2 seconds while thinking
      intervalRef.current = setInterval(() => {
        wordRef.current = getRandom(FI_THINKING_WORDS);
        symbolRef.current = getRandom(FI_SYMBOLS);
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
          {symbolRef.current} {wordRef.current}
        </span>
      )}
    </Flexbox>
  );
});

ThinkingTitle.displayName = 'ThinkingTitle';

export default ThinkingTitle;
