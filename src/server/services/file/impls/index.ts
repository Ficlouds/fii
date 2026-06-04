import { type LobeChatDatabase } from '@lobechat/database';

import { type FileServiceImpl } from './type';

/**
 * Create file service module
 * Returns S3 file implementation for cloud storage, or a no-op when S3 is disabled.
 */
export const createFileServiceModule = (db: LobeChatDatabase): FileServiceImpl => {
  const s3Enabled = process.env.S3_ENABLED === '1' || process.env.S3_ENABLED === 'true';
  if (!s3Enabled) {
    // Return a no-op implementation when S3 is not configured
    return {
      uploadContent: async () => ({ url: '' }),
      uploadFile: async () => ({ url: '' }),
      deleteFile: async () => {},
      deleteFiles: async () => {},
      getFileUrl: async () => '',
      getFileContent: async () => '',
    } as unknown as FileServiceImpl;
  }
  const { S3StaticFileImpl } = require('./s3');
  return new S3StaticFileImpl(db);
};
