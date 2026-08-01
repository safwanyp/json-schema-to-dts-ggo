import type { CoreSchemaMetaSchema } from './schema';

export * from './parser';
export { DirectoryGenerationError, generateTypesFromDirectory } from './directory';
export type {
  DirectoryGenerationIssue,
  DirectoryGenerationOptions,
  DirectoryGenerationResult,
  GeneratedDeclarationFile,
  GeneratedDeclarationStatus,
  OutputCollisionPolicy,
} from './directory';
export type { JSONSchema7Type as JSONValue } from './types';
export type { CoreSchemaMetaSchema };
export type JSONSchema = Exclude<CoreSchemaMetaSchema, boolean>;
