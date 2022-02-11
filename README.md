# ts-interface-builder

[![Build Status](https://travis-ci.org/gristlabs/ts-interface-builder.svg?branch=master)](https://travis-ci.org/gristlabs/ts-interface-builder)
[![npm version](https://badge.fury.io/js/ts-interface-builder.svg)](https://badge.fury.io/js/ts-interface-builder)

> Compile TypeScript interfaces into a description that allows runtime validation.

This tool runs at build time to create runtime validators from TypeScript
interfaces. It allows validating data, such as parsed JSON objects received
over the network, or parsed JSON or YAML files, to check if they satisfy a
TypeScript interface, and to produce informative error messages if they do not.

This package works together with [ts-interface-checker](https://github.com/gristlabs/ts-interface-checker).
You use `ts-interface-builder` in a build step that generates code for a runtime description of your interfaces.
You then use `ts-interface-checker` in your code to create validator functions from this runtime description.

These runtime descriptions come in the form of `ts-interface-checker` ["type suites"](https://github.com/gristlabs/ts-interface-checker#type-suites),
one per input TS file.

This package offers two ways to get generated "type suites" in your code:
1. CLI - Run a command to save generated type suites in new TS or JS files
2. Babel Macro *(advanced)* - Call a Babel macro function that returns a generated type suite

## Installation

```
npm install --save-dev ts-interface-builder
npm install --save ts-interface-checker
```

## CLI Usage

**Run a command to save generated type suites in new TS or JS files**

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
  "color": t.opt("string")
});

const exportedTypeSuite: t.ITypeSuite = {
  Square,
};
export default exportedTypeSuite;
```

See [ts-interface-checker documentation](https://github.com/gristlabs/ts-interface-checker#readme) for how to use the exported type suite in your code.

## Babel Macro Usage

**Call a Babel macro function that returns a generated type suite**

This method requires your project to have [Babel](https://babeljs.io/docs/en/) and [`babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros) set up.
See installation instructions for each in their respective documentation.
Note that if you're using a Babel preset, you might unknowingly already have `babel-plugin-macros` set up.
For example, the popular [`babel-preset-react-app`](https://github.com/facebook/create-react-app/tree/master/packages/babel-preset-react-app)
already includes `babel-plugin-macros`.

With those things set up, in your code you can now just call the `getTypeSuite` macro function (exported from `ts-interface-builder/macro`) to get a type suite.
During your Babel build step, the required type suites will be generated and included in Babel's output.

For example, if you have a TypeScript file that defines some types:
```typescript
// foo.ts
interface Square {
  size: number;
  color?: string;
}
```

You can get a type suite for it in your code like this:
```typescript
import { getTypeSuite } from 'ts-interface-builder/macro';

const fooTypeSuite = getTypeSuite('./foo.ts', { /* options */ });
```

The code above would be transpiled into:
```js
import * as t from "ts-interface-checker";

function once(fn) {
  var result;
  return function () {
    return result || (result = fn());
  };
}

var typeSuite0 = once(function () {
  return {
    Square: t.iface([], {
      "size": "number",
      "color": t.opt("string")
    })
  };
});

var fooTypeSuite = typeSuite0();
```

See [ts-interface-checker documentation](https://github.com/gristlabs/ts-interface-checker#readme) for how to use the returned type suite in your code.

The `getCheckers` macro function is also exported, as a convenience, to get a checker suite (with validator functions) directly
instead of first getting a type suite and then creating a checker suite from it (using `ts-interface-checker`s `createCheckers` function). 
As with `getTypeSuite`, repeated calls to `getCheckers` using the same arguments will return the same object.

## Limitations
This module currently does not support generics, except Promises. Promises are supported by unwrapping `Promise<T>` to simply `T`.
