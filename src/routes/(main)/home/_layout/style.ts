import { createStaticStyles } from 'antd-style';

export const styles = createStaticStyles(({ css, cssVar }) => ({
  // Absolutely positioned container, fills parent
  absoluteContainer: css`
    position: absolute;
    inset: 0;
    transition: all 0.25s ease;

    & > * {
      transition: width 0.25s ease, flex 0.25s ease;
    }
  `,

  // Content area - dark mode
  contentDark: css`
    overflow: hidden;
    background: #1f1f1e;
  `,

  // Content area - light mode
  contentLight: css`
    overflow: hidden;
    background: #efefed;
  `,
}));
