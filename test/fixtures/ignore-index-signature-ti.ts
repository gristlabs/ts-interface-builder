import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const ITest = t.iface([], {
});

export const INestedLiteralIndexSignature = t.iface([], {
  "nestedIndexSignature": t.iface([], {
  }),
});

const exportedTypeSuite: t.ITypeSuite = {
  ITest,
  INestedLiteralIndexSignature,
};
export default exportedTypeSuite;
