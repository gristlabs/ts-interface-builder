const t = require("ts-interface-checker");

module.exports = {
  SomeInterface: t.iface([], {
    "foo": "number",
  }),

  SomeEnum: t.enumtype({
    "Foo": 0,
  }),

  SomeAlias: t.name("number"),
};
