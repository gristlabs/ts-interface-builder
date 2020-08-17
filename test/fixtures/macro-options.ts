import { getCheckers } from "../../macro";
// Note: default options defined in babel plugin options in ../test_macro.ts

const dir = ".";
const file = `${dir}/imports-parent.ts`;

export const checkersUsingDefaultOptions = getCheckers(file);

export const checkersWithInlineOptions = getCheckers(file, {
  inlineImports: false,
});
