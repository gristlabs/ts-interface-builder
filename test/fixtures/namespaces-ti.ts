import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const SomeInterface = t.iface([], {
  "foo": "number",
});

export const SomeEnum = t.enumtype({
  "Foo": 0,
  "Boo": 1,
});

export const SomeAlias = t.name("number");

const exportedTypeSuite: t.ITypeSuite = {
  SomeInterface,
  SomeEnum,
  SomeAlias,
};
export default exportedTypeSuite;
