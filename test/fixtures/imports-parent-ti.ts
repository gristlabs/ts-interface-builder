import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const TypeA = t.iface([], {
});

export const TypeB = t.iface([], {
});

export const TypeC = t.iface([], {
});

export const TypeD = t.iface([], {
});

export const TypeAll = t.iface([], {
  "a": "TypeA",
  "b": "TypeB",
  "c": "TypeC",
  "d": "TypeD",
});

const exportedTypeSuite: t.ITypeSuite = {
  TypeA,
  TypeB,
  TypeC,
  TypeD,
  TypeAll,
};
export default exportedTypeSuite;
