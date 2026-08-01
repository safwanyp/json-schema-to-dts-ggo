# json-schema-to-dts

Convert JSON Schema definitions into accurate (as possible) TypeScript definitions, specifying how the main schema types and lifted sub-schemas should be declared / exported.

## Example

Given the schema

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "The name of an object" },
    "not_annotated": { "type": "null" },
    "command": {
      "oneOf": [{ "const": "a constant!" }, { "enum": ["multiple", { "options": "are allowed" }] }]
    }
  }
}
```

And these options:

```ts
const options = {
  topLevel: {
    isExported: true,
  },
};
```

We get the following result:

```ts
type JSONPrimitive = boolean | null | number | string;
type JSONValue =
  | JSONPrimitive
  | JSONValue[]
  | {
      [key: string]: JSONValue;
    };
export type Test = {
  /** The name of an object */
  name?: string;
  not_annotated?: null;
  command?:
    | 'a constant!'
    | (
        | 'multiple'
        | {
            options: 'are allowed';
          }
      );
};
```

## API

### `generateTypesFromDirectory(options)`

Generate one self-contained `.d.ts` file for every matched JSON Schema file:

```ts
import { generateTypesFromDirectory } from 'json-schema-to-dts';

const result = await generateTypesFromDirectory({
  schemaDirectory: './schemas',
  outputDirectory: './types',
  schemaGlob: '**/*.schema.json',
});
```

Relative directories are preserved and the final `.json` suffix is replaced with `.d.ts`:

```text
schemas/user.schema.json       -> types/user.schema.d.ts
schemas/admin/role.schema.json -> types/admin/role.schema.d.ts
```

The options are:

- `schemaDirectory` - directory from which schema files are discovered
- `outputDirectory` - directory to which declaration files are written
- `schemaGlob` - optional glob or array of globs relative to `schemaDirectory`; defaults to `**/*.json`
- `parserOptions` - optional [`Parser`](#new-parser) constructor options applied to every schema
- `compileOptions` - optional [`Parser.compile`](#compileoptions) options applied to every schema
- `outputCollision` - optional untracked-file policy: `"error"` (the default) or `"rename"`

The returned result contains absolute schema and declaration paths, each file's generated type name and `created`, `updated`, or `unchanged` status, parser warnings, and absolute paths of stale generated files that were removed.

Only matched, non-symlink JSON files are available for `$ref` resolution. Invalid JSON, non-object/non-boolean roots, unresolved references, duplicate `$id` values, and zero matches fail before declarations are written. The generator tracks its own files in `.json-schema-to-dts-manifest.json`, preserves unrelated output files, and skips unchanged writes.

Failures reject with `DirectoryGenerationError`, whose `issues` property contains structured error details.

### `new Parser()`

Produce a new `Parser` instance.

#### `.addSchema(uri, schema)`

Add a schema to the parser where:

- `uri` - is a string representing the schema's uri (ie: `file:///path/to/schema.json`)
- `schema` - is the json object representation of the schema

#### `.compile(options)`

Compile all added schemas where:

- `topLevel` - options for root schemas
  - `hasDeclareKeyword` - _(optional)_ mark the type declaration as `declare`
  - `isExported` - _(optional)_ `export` the type declaration
- `lifted` - options for sub-schemas that have been lifted during compilation
  - `hasDeclareKeyword` - _(optional)_ mark the type declaration as `declare`
  - `isExported` - _(optional)_ `export` the type declaration

Returns an object `{ diagnostics, text }` where:

- `diagnostics` - is an array of diagnostics
- `text` - is the resulting typescript definitions
