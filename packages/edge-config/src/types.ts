import type { BusinessEdgeConfigData } from '@lobechat/business-config/server';

/**
 * Localizable fields for a single Billboard item.
 * cover / linkUrl / order / time window are not localized.
 */
export interface BillboardItemLocaleFields {
  description?: string;
  linkLabel?: string;
  title?: string;
}

/**
 * A single Billboard carousel item (content shown in the operation card at the bottom-left of the Home sidebar).
 */
export interface BillboardItem {
  cover?: string | null;
  description: string;
  /**
   * Per-locale overrides. Falls back to the default fields (title / description / linkLabel) when missing.
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
 * A Billboard set (a group of items displayed as a carousel on the frontend).
 * In the Sprint-style model, each env has at most 1 set;
 * actual display is also constrained by the startAt / endAt time window.
 */
export interface BillboardSet {
  /** ISO timestamp — end of the time window; LobeHub stops showing the billboard after this point */
  endAt: string;
  /**
   * Per-locale overrides for billboard-level copy (currently only title, used for the ? menu).
   */
  i18n?: Record<string, BillboardLocaleFields>;
  id: number;
  items: BillboardItem[];
  /** Unique identifier */
  slug: string;
  /** ISO timestamp — start of the time window; LobeHub does not show the billboard before this point */
  startAt: string;
  /** Used for display in the ? menu */
  title: string;
}

/**
 * Pure Billboard content stored in Edge Config. Sprint-style: each env has exactly 1 entry or null.
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
   * Billboard snapshot. Each Vercel deployment reads from the `billboards` key in its own store —
   * dev deployments point to the dev store, prod deployments point to the prod store, transparent to the LobeHub side.
   */
  billboards?: BillboardSnapshot;

  /**
   * Feature flags configuration
   */
  feature_flags?: Record<string, boolean | string[]>;
}

export type EdgeConfigKeys = keyof EdgeConfigData;
