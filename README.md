# ts-interface-builder

> Validate data against TypeScript interfaces at runtime.

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

```
$(npm bin)/ts-interface-builder [options] <typescript-files...>
```

By default, produces `<ts-file>-ti.ts` file for each input file, which has runtime definitions of types in the input file. For example:

...
TO BE COMPLETED
...
