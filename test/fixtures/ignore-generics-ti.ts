import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const ITest = t.iface([], {
  "myGeneric": "any",
});

export const IMyType = t.iface([], {
  "value": "T",
});

const exportedTypeSuite: t.ITypeSuite = {
  ITest,
  IMyType,
};
export default exportedTypeSuite;
