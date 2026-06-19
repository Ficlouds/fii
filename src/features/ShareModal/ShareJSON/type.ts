import { type TopicExportMode } from '@ficlouds/types';

export interface BaseExportOptions {
  includeTool: boolean;
  withSystemRole: boolean;
}

export interface FieldType extends BaseExportOptions {
  exportMode: TopicExportMode;
}
