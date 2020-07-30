import * as t from "ts-interface-checker";
// Note: default options defined in babel plugin options in ../test_macro.ts
var dir = '.';
var file = dir + "/imports-parent.ts";
export var checkersUsingDefaultOptions = t.createCheckers({
  TypeA: t.iface([], {}),
  TypeB: t.iface([], {}),
  TypeC: t.iface([], {}),
  TypeD: t.iface([], {}),
  TypeAll: t.iface([], {
    "a": "TypeA",
    "b": "TypeB",
    "c": "TypeC",
    "d": "TypeD"
  })
});
export var checkersUsingInlineOptions = t.createCheckers({
  TypeAll: t.iface([], {
    "a": "TypeA",
    "b": "TypeB",
    "c": "TypeC",
    "d": "TypeD"
  })
});
