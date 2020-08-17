import { getTypeSuite, getCheckers } from "../../macro";

export const t = null;
export const once = null;

// @ts-ignore-rule
interface LocalInterface {
  // does not need to be exported
  foo: number;
}

export const typeSuite0 = getTypeSuite(undefined, { inlineImports: false });

export function getTypeSuite0() {
  const typeSuite0 = getTypeSuite(undefined, { inlineImports: false });
  return typeSuite0;
}

export const checkerSuite0 = getCheckers(undefined, { inlineImports: false });

export function getCheckerSuite0() {
  const checkerSuite0 = getCheckers(undefined, { inlineImports: false });
  return checkerSuite0;
}
