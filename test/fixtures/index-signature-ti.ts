import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const SquareConfig = t.iface([], {
  "color": "string",
  "width": t.opt("number"),
  [t.indexKey]: "any",
});

export const IndexSignatures = t.iface([], {
  "data": t.iface([], {
    [t.indexKey]: t.array("number"),
  }),
});

const exportedTypeSuite: t.ITypeSuite = {
  SquareConfig,
  IndexSignatures,
};
export default exportedTypeSuite;
