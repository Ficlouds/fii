import { type ErrorType } from '@ficlouds/types';

export interface BusinessErrorContentResult {
  errorType?: string;
  hideMessage?: boolean;
}

export default function useBusinessErrorContent(
  // eslint-disable-next-line unused-imports/no-unused-vars
  errorType?: ErrorType | string,
): BusinessErrorContentResult {
  return {};
}
