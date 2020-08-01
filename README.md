# ts-interface-builder

[![Build Status](https://travis-ci.org/gristlabs/ts-interface-builder.svg?branch=master)](https://travis-ci.org/gristlabs/ts-interface-builder)
[![npm version](https://badge.fury.io/js/ts-interface-builder.svg)](https://badge.fury.io/js/ts-interface-builder)

> Compile TypeScript interfaces into a description that allows runtime validation.

This tool runs at build time to create runtime validators from TypeScript
interfaces. It allows validating data, such as parsed JSON objects received
over the network, or parsed JSON or YAML files, to check if they satisfy a
TypeScript interface, and to produce informative error messages if they do not.

## Installation

```
npm install --save-dev ts-interface-builder
npm install --save ts-interface-checker
```

## Usage

This module works together with [ts-interface-checker](https://github.com/gristlabs/ts-interface-checker) module. You use
`ts-interface-builder` in a build step that converts some TypeScript interfaces
to a new TypeScript or JavaScript file (with `-ti.ts` or `-ti.js` extension) that provides a runtime
description of the interface. You then use `ts-interface-checker` in your
program to create validator functions from this runtime description.

```
`npm bin`/ts-interface-builder [options] <typescript-files...>
```

By default, produces `<ts-file>-ti.ts` file for each input file, which has
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
`npm bin`/ts-interface-builder foo.ts
```

It produces a file like this:
```typescript
// foo-ti.ts
import * as t from "ts-interface-checker";

export const Square = t.iface([], {
  "size": "number",
  "color": t.opt("string"),
});

const exportedTypeSuite: t.ITypeSuite = {
  Square,
};
export default exportedTypeSuite;
```

See [ts-interface-checker](https://github.com/gristlabs/ts-interface-checker) module for how to use this file in your program.

## Limitations
This module currently does not support generics, except Promises. Promises are supported by unwrapping `Promise<T>` to simply `T`.
