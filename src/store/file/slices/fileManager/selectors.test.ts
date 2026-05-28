import { describe, expect, it } from 'vitest';

import { type FilesStoreState, initialState } from '@/store/file/initialState';
import { type FileListItem } from '@/types/files';
import { type ResourceItem } from '@/types/resource';

import { fileManagerSelectors } from './selectors';

const now = new Date('2026-05-29T00:00:00.000Z');

const createFile = (overrides: Partial<FileListItem> = {}): FileListItem => ({
  chunkCount: null,
  chunkingError: null,
  createdAt: now,
  embeddingError: null,
  fileType: 'application/pdf',
  finishEmbedding: false,
  id: 'file_legacy',
  name: 'legacy.pdf',
  size: 1024,
  sourceType: 'file',
  updatedAt: now,
  url: 'files/legacy.pdf',
  ...overrides,
});

const createResource = (overrides: Partial<ResourceItem> = {}): ResourceItem => ({
  chunkCount: 2,
  chunkingError: null,
  chunkingStatus: 'success',
  createdAt: now,
  embeddingError: null,
  embeddingStatus: 'success',
  fileType: 'application/pdf',
  finishEmbedding: true,
  id: 'file_resource',
  name: 'resource.pdf',
  size: 2048,
  sourceType: 'file',
  updatedAt: now,
  url: 'files/resource.pdf',
  ...overrides,
});

const createState = (overrides: Partial<FilesStoreState> = {}): FilesStoreState => ({
  ...initialState,
  resourceMap: new Map(),
  syncingIds: new Set(),
  ...overrides,
});

describe('fileManagerSelectors.getFileById', () => {
  it('returns the resource item from resourceMap when ResourceManager owns the visible data', () => {
    const resource = createResource();
    const legacyFile = createFile({ id: resource.id, name: 'stale.pdf' });
    const state = createState({
      fileList: [legacyFile],
      resourceMap: new Map([[resource.id, resource]]),
    });

    expect(fileManagerSelectors.getFileById(resource.id)(state)).toBe(resource);
  });

  it('falls back to the legacy fileList when the resource cache does not contain the id', () => {
    const legacyFile = createFile();
    const state = createState({ fileList: [legacyFile] });

    expect(fileManagerSelectors.getFileById(legacyFile.id)(state)).toBe(legacyFile);
  });
});
