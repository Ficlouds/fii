'use client';

import { FiDetailProvider } from './FiDetailProvider';
import SkillDetailInner from './SkillDetailInner';

export interface FiSkillDetailContentProps {
  identifier: string;
}

export const FiSkillDetailContent = ({ identifier }: FiSkillDetailContentProps) => {
  return (
    <FiDetailProvider identifier={identifier}>
      <SkillDetailInner type="lobehub" />
    </FiDetailProvider>
  );
};
