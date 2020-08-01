import * as t from "ts-interface-checker";

export const SomeInterface = t.iface([], {
  "foo": "number",
});

export const SomeEnum = t.enumtype({
  "Foo": 0,
});

export const SomeAlias = t.name("number");

const exportedTypeSuite = {
  SomeInterface,
  SomeEnum,
  SomeAlias,
};
export default exportedTypeSuite;
