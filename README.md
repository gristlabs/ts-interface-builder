# ts-joi-schema-generator

This was forked from [ts-interface-builder](https://github.com/gristlabs/ts-interface-builder) with the desire to use [Joi](https://github.com/hapijs/joi) instead of [ts-interface-checker](https://github.com/gristlabs/ts-interface-checker).

> Compile TypeScript interfaces into a description that allows runtime validation.

This tool runs at build time to create runtime validators from TypeScript
interfaces. It allows validating data, such as parsed JSON objects received
over the network, or parsed JSON or YAML files, to check if they satisfy a
TypeScript interface, and to produce informative error messages if they do not.

## Usage

This module makes use of [Joi](https://github.com/hapijs/joi) to validate, so make sure to install that along side this.
```
npm install --save joi
```

`ts-joi-schema-generator` in a build step that converts some TypeScript interfaces
to a new TypeScript file (with `-schema.ts` extension) that provides a runtime
description of the interface. These are Joi schemas, and are ready to use as-is.

```
`npm bin`/ts-joi-schema-generator [options] <typescript-files...>
```

By default, produces `<ts-file>-schema.ts` file for each input file, which has
runtime definitions for all types in the input file. For example, if you have a
TypeScript file that defines some types:

```typescript
// foo.ts
interface Square {
  size: number;
  color?: string;
}
```

Then you can generate code for runtime checks with:
```bash
`npm bin`/ts-interface-schema-generator foo.ts
```

It produces a file like this:
```typescript
// foo-schema.js
import * as Joi from 'joi';

export const Square = Joi.object().keys({
  'size': Joi.number().required(),
  'color': Joi.string()
}).strict();
```

Check [Joi](https://github.com/hapijs/joi) to see how to validate or modify schemas to your needs.

## Limitations
This module currently does not support generics. Some may be implemented (e.g. Omit and Partial) that are easy to define.

The original builder supported promises, but it just unwrapped the Promise which I found misleading.

## Notes
The tests are borked because I haven't bothered updating them yet, needed this done fast.