import {makeCheckers} from "../../macro";
// Note: default options defined in babel plugin options in ../test_macro.ts

const dir = '.'
const file = `${dir}/imports-parent.ts`

export const checkersUsingDefaultOptions = makeCheckers(file);

export const checkersUsingInlineOptions = makeCheckers(file, {inlineImports: false});
