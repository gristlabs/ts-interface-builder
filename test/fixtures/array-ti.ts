import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const IMyArrayContainer = t.iface([], {
  "myArray": t.array("number"),
  "myArray2": t.array(t.iface([], {
    "foo": "string",
    "bar": "number",
  })),
  "myArray3": t.array("number"),
  "myArray4": t.tuple("number"),
  "myArray5": t.tuple("number", "number"),
  "myArray6": t.tuple("number", t.union("number", "undefined")),
  "myArray7": t.tuple("number", t.opt("number")),
});

const exportedTypeSuite: t.ITypeSuite = {
  IMyArrayContainer,
};
export default exportedTypeSuite;
