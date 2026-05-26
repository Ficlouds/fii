'use client';

import type { DocumentSharePermission, DocumentShareVisibility } from '@lobechat/types';
import { Button, copyToClipboard, Flexbox, Input, Popover, Text } from '@lobehub/ui';
import { Select } from '@lobehub/ui/base-ui';
import { App } from 'antd';
import { createStaticStyles, cssVar } from 'antd-style';
import { ExternalLinkIcon, EyeIcon, GlobeIcon, LockIcon } from 'lucide-react';
import { type FC, type ReactElement, type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { mutate as globalMutate } from 'swr';

import { SHARED_PAGE_PROBE_KEY } from '@/hooks/useSharedPageProbe';
import { lambdaClient } from '@/libs/trpc/client';

type AccessValue = 'private' | 'link';

const styles = createStaticStyles(({ css, cssVar }) => ({
  content: css`
    width: 360px;
  `,
  footer: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  footerLink: css`
    color: ${cssVar.colorTextTertiary};

    &:hover {
      color: ${cssVar.colorText};
    }
  `,
  iconWrap: css`
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;
    border-radius: ${cssVar.borderRadius};
  `,
  iconLink: css`
    color: ${cssVar.colorPrimary};
    background: ${cssVar.colorPrimaryBg};
  `,
  iconLocked: css`
    color: ${cssVar.colorTextSecondary};
    background: ${cssVar.colorFillSecondary};
  `,
  label: css`
    font-size: 12px;
    color: ${cssVar.colorTextTertiary};
  `,
  linkInput: css`
    flex: 1;
    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
  `,
  optionSub: css`
    font-size: 11.5px;
    color: ${cssVar.colorTextTertiary};
  `,
  optionTitle: css`
    font-size: 13px;
    color: ${cssVar.colorText};
  `,
}));

const SHARE_SETTINGS_KEY = (id: string) => ['document.getShareSettings', id];

const toAccessValue = (visibility: DocumentShareVisibility): AccessValue =>
  visibility === 'link' ? 'link' : 'private';

const fromAccessValue = (
  value: AccessValue,
): { permission: DocumentSharePermission; visibility: DocumentShareVisibility } =>
  value === 'link'
    ? { permission: 'read', visibility: 'link' }
    : { permission: 'read', visibility: 'private' };

interface SharePopoverProps {
  children: ReactElement;
  documentId: string;
}

const SharePopover: FC<SharePopoverProps> = ({ children, documentId }) => {
  const { t } = useTranslation('pageShare');
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);

  const { data: settings, mutate: refetchSettings } = useSWR(
    open ? SHARE_SETTINGS_KEY(documentId) : null,
    () => lambdaClient.document.getShareSettings.query({ id: documentId }),
  );

  const current: AccessValue = settings
    ? toAccessValue(settings.visibility as DocumentShareVisibility)
    : 'private';

  const isShared = current === 'link';
  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/page/${documentId}` : '';

  const accessOptions: {
    icon: ReactNode;
    iconClassName: string;
    sub: string;
    title: string;
    value: AccessValue;
  }[] = [
    {
      icon: <LockIcon color={cssVar.colorTextSecondary} size={14} />,
      iconClassName: styles.iconLocked,
      sub: t('popover.options.private.sub'),
      title: t('popover.options.private.title'),
      value: 'private',
    },
    {
      icon: <GlobeIcon color={cssVar.colorPrimary} size={14} />,
      iconClassName: styles.iconLink,
      sub: t('popover.options.link.sub'),
      title: t('popover.options.link.title'),
      value: 'link',
    },
  ];

  const handleChange = async (value: AccessValue) => {
    const { permission, visibility } = fromAccessValue(value);
    await lambdaClient.document.updateShareSettings.mutate({
      id: documentId,
      permission,
      visibility,
    });
    await refetchSettings();
    void globalMutate(SHARED_PAGE_PROBE_KEY(documentId));
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(shareUrl);
      message.success(t('popover.copied'));
    } catch {
      message.error(t('popover.copyFailed'));
    }
  };

  const renderOption = (option: (typeof accessOptions)[number]) => (
    <Flexbox horizontal align={'center'} gap={10} paddingBlock={4}>
      <span className={`${styles.iconWrap} ${option.iconClassName}`}>{option.icon}</span>
      <Flexbox gap={2}>
        <span className={styles.optionTitle}>{option.title}</span>
        <span className={styles.optionSub}>{option.sub}</span>
      </Flexbox>
    </Flexbox>
  );

  return (
    <Popover
      arrow={false}
      open={open}
      placement={'bottomRight'}
      styles={{ content: { padding: 16 } }}
      trigger={'click'}
      content={
        <Flexbox className={styles.content} gap={14}>
          <Text strong style={{ fontSize: 14 }}>
            {t('popover.title')}
          </Text>

          <Flexbox gap={6}>
            <span className={styles.label}>{t('popover.sectionAccess')}</span>
            <Select<AccessValue>
              options={accessOptions}
              style={{ width: '100%' }}
              value={current}
              labelRender={({ value }) => {
                const option = accessOptions.find((o) => o.value === value);
                if (!option) return null;
                return (
                  <Flexbox horizontal align={'center'} gap={8}>
                    <span className={`${styles.iconWrap} ${option.iconClassName}`}>
                      {option.icon}
                    </span>
                    <span className={styles.optionTitle}>{option.title}</span>
                  </Flexbox>
                );
              }}
              optionRender={(option) => {
                const target = accessOptions.find((o) => o.value === option.value);
                return target ? renderOption(target) : null;
              }}
              onChange={handleChange}
            />
          </Flexbox>

          <Flexbox horizontal align={'center'} gap={6}>
            <Input
              readOnly
              className={styles.linkInput}
              value={isShared ? shareUrl : t('popover.linkPrivatePlaceholder')}
            />
            <Button disabled={!isShared} onClick={handleCopy}>
              {t('popover.copy')}
            </Button>
          </Flexbox>

          <Flexbox horizontal align={'center'} className={styles.footer} justify={'space-between'}>
            <Flexbox horizontal align={'center'} gap={6}>
              <EyeIcon size={12} />
              {t('popover.sectionViews', { count: settings?.pageViewCount ?? 0 })}
            </Flexbox>
            {isShared && (
              <a className={styles.footerLink} href={shareUrl} rel={'noreferrer'} target={'_blank'}>
                <Flexbox horizontal align={'center'} gap={4}>
                  {t('popover.openInNewTab')}
                  <ExternalLinkIcon size={12} />
                </Flexbox>
              </a>
            )}
          </Flexbox>
        </Flexbox>
      }
      onOpenChange={setOpen}
    >
      {children}
    </Popover>
  );
};

export default SharePopover;
