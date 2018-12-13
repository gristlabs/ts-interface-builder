import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const TypeAll = t.iface([], {
  "a": "TypeA",
  "b": "TypeB",
  "c": "TypeC",
  "d": "TypeD",
});

const exportedTypeSuite: t.ITypeSuite = {
  TypeAll,
};
export default exportedTypeSuite;
