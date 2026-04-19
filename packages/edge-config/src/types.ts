import type { BusinessEdgeConfigData } from '@lobechat/business-config/server';

/**
 * Localizable fields for a single Billboard item.
 * cover / linkUrl / ordering / time window are not translated.
 */
export interface BillboardItemLocaleFields {
  description?: string;
  linkLabel?: string;
  title?: string;
}

/**
 * Billboard carousel item (single content entry of the operational card in the bottom-left of the Home sidebar)
 */
export interface BillboardItem {
  cover?: string | null;
  description: string;
  /**
   * Locale-specific overrides. Falls back to default fields (title / description / linkLabel) when missing.
   * Keys use LobeHub locale codes (e.g. `zh-CN`, `en-US`, `ja-JP`).
   */
  i18n?: Record<string, BillboardItemLocaleFields>;
  id: number;
  linkLabel?: string | null;
  linkUrl?: string | null;
  title: string;
}

/**
 * Localizable fields at the Billboard level (currently only title).
 */
export interface BillboardLocaleFields {
  title?: string;
}

/**
 * Billboard set (a group of items displayed as a carousel on the frontend).
 * In Sprint-style model, each env has at most 1 set;
 * actual display is also constrained by the startAt / endAt time window.
 */
export interface BillboardSet {
  /** ISO timestamp — end of time window; LobeHub stops displaying after this point */
  endAt: string;
  /**
   * Locale overrides for billboard-level copy (currently only title, used for the ? menu).
   */
  i18n?: Record<string, BillboardLocaleFields>;
  id: number;
  items: BillboardItem[];
  /** Unique identifier */
  slug: string;
  /** ISO timestamp — start of time window; LobeHub does not display before this point */
  startAt: string;
  /** Used for ? menu display */
  title: string;
}

/**
 * Pure Billboard content stored in Edge Config. Sprint-style: each env has at most 1 entry or null.
 */
export type BillboardSnapshot = BillboardSet | null;

/**
 * EdgeConfig complete configuration type
 */
export interface EdgeConfigData extends BusinessEdgeConfigData {
  /**
   * Assistant blacklist
   */
  assistant_blacklist?: string[];
  /**
   * Assistant whitelist
   */
  assistant_whitelist?: string[];

  /**
   * Billboard snapshot. Each Vercel deployment reads the `billboards` key from its own store —
   * dev deployment points to dev store, prod deployment points to prod store, transparent to LobeHub.
   */
  billboards?: BillboardSnapshot;

  /**
   * Feature flags configuration
   */
  feature_flags?: Record<string, boolean | string[]>;
}

export type EdgeConfigKeys = keyof EdgeConfigData;
