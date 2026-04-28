import { createStaticStyles } from 'antd-style';

export const styles = createStaticStyles(({ css, cssVar }) => ({
  actionLink: css`
    cursor: pointer;

    display: inline-flex;
    gap: 4px;
    align-items: center;

    padding-block: 2px;
    padding-inline: 0;

    font-size: 12px;
    color: ${cssVar.colorTextTertiary};

    transition: color ${cssVar.motionDurationMid};

    &:hover {
      color: ${cssVar.colorPrimary} !important;
    }
  `,
  description: css`
    margin-block-start: 2px;
    font-size: 12px;
    line-height: 1.45;
    color: ${cssVar.colorTextTertiary};
  `,
  disabled: css`
    pointer-events: none;
    opacity: 0.6;
  `,
  dot: css`
    width: 6px;
    height: 6px;
    border-radius: 50%;

    background: ${cssVar.colorFillSecondary};

    transition: background ${cssVar.motionDurationMid};
  `,
  dotActive: css`
    background: ${cssVar.colorPrimary};
  `,
  dotDone: css`
    opacity: 0.45;
    background: ${cssVar.colorPrimary};
  `,
  letter: css`
    flex: none;

    width: 20px;
    padding-block-start: 1px;

    font-size: 12px;
    font-weight: 500;
    line-height: 1.5;
    color: ${cssVar.colorTextTertiary};
    text-align: center;
  `,
  letterSelected: css`
    color: ${cssVar.colorPrimary};
  `,
  navArrow: css`
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;
    border-radius: ${cssVar.borderRadiusSM}px;

    color: ${cssVar.colorTextTertiary};

    transition:
      background ${cssVar.motionDurationMid},
      color ${cssVar.motionDurationMid};

    &:hover {
      color: ${cssVar.colorText};
      background: ${cssVar.colorFillQuaternary};
    }
  `,
  navArrowDisabled: css`
    pointer-events: none;
    opacity: 0.3;
  `,
  option: css`
    cursor: pointer;

    padding-block: 6px;
    padding-inline: 10px;
    border-radius: ${cssVar.borderRadius}px;

    transition: background ${cssVar.motionDurationMid};

    &:hover {
      background: ${cssVar.colorFillQuaternary};
    }
  `,
  optionLabel: css`
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.5;
  `,
  optionSelected: css`
    background: ${cssVar.colorPrimaryBg};

    &:hover {
      background: ${cssVar.colorPrimaryBg};
    }
  `,
  otherInput: css`
    flex: 1;
  `,
  otherLabel: css`
    flex: none;
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  otherRow: css`
    padding-block: 4px;
    padding-inline: 8px;
  `,
  preview: css`
    overflow: auto;

    max-height: 200px;
    padding-block: 8px;
    padding-inline: 10px;
    border-radius: ${cssVar.borderRadiusSM}px;

    background: ${cssVar.colorFillQuaternary};
  `,
  questionText: css`
    margin-block-end: 8px;

    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    color: ${cssVar.colorText};
  `,
  stepCount: css`
    font-size: 11px;
    color: ${cssVar.colorTextTertiary};
  `,
  stepper: css`
    margin-block-end: 4px;
  `,
}));
