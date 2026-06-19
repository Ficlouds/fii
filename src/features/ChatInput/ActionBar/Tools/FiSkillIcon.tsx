import { type FiSkillProviderType } from '@ficlouds/const';
import { Icon } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { memo } from 'react';

export const SKILL_ICON_SIZE = 20;

/**
 * Fi Skill Provider icon component
 */
const FiSkillIcon = memo<Pick<FiSkillProviderType, 'icon' | 'label'> & { size: number }>(
  ({ icon, label, size = SKILL_ICON_SIZE }) => {
    if (typeof icon === 'string') {
      return (
        <img
          alt={label}
          src={icon}
          style={{ maxHeight: size, maxWidth: size, objectFit: 'contain' }}
        />
      );
    }

    return <Icon fill={cssVar.colorText} icon={icon} size={size} />;
  },
);

FiSkillIcon.displayName = 'FiSkillIcon';

export default FiSkillIcon;
