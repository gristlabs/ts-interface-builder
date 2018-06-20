import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const IMyArrayContainer = t.iface([], {
  "myArray": t.array("number"),
  "myArray2": t.array(t.iface([], {
    "foo": "string",
    "bar": "number",
  })),
});

const exportedTypeSuite: t.ITypeSuite = {
  IMyArrayContainer,
};
export default exportedTypeSuite;
