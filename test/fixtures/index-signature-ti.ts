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

export const CellValue = t.union("number", "string", "boolean", "null", t.tuple("string", t.rest(t.array("unknown"))));

export const RowRecord = t.iface([], {
  "id": "number",
  [t.indexKey]: "CellValue",
});

const exportedTypeSuite: t.ITypeSuite = {
  SquareConfig,
  IndexSignatures,
  CellValue,
  RowRecord,
};
export default exportedTypeSuite;
