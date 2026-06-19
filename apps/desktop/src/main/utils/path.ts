import { pathToFileURL } from 'node:url';

export const filePathToAppUrl = (filePath: string) => {
  return `app://ficlouds.com${pathToFileURL(filePath).pathname}`;
};
