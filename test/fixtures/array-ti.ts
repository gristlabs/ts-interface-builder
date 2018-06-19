import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const IMyArrayContainer = t.iface([], {
  "myArray": t.array("number"),
});

const exportedTypeSuite: t.ITypeSuite = {
  IMyArrayContainer,
};
export default exportedTypeSuite;
