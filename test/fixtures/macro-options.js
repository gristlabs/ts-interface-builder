import * as t from "ts-interface-checker";

function once(fn) {
  var result;
  return function () {
    return result || (result = fn());
  };
}

var typeSuite0 = once(function () {
  return {
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
  };
});
var typeSuite1 = once(function () {
  return {
    TypeAll: t.iface([], {
      "a": "TypeA",
      "b": "TypeB",
      "c": "TypeC",
      "d": "TypeD"
    })
  };
});
var checkerSuite0 = once(function () {
  return t.createCheckers(typeSuite0());
});
var checkerSuite1 = once(function () {
  return t.createCheckers(typeSuite1());
});
// Note: default options defined in babel plugin options in ../test_macro.ts
var dir = ".";
var file = dir + "/imports-parent.ts";
export var checkersUsingDefaultOptions = checkerSuite0();
export var checkersWithInlineOptions = checkerSuite1();