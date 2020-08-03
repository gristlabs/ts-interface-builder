import * as t from "ts-interface-checker";

function once(fn) {
  var result;
  return function () {
    return result || (result = fn());
  };
}

var typeSuite0 = once(function () {
  return {
    LocalInterface: t.iface([], {
      "foo": "number"
    })
  };
});
var checkerSuite0 = once(function () {
  return t.createCheckers(typeSuite0());
});
var _t = null;
export { _t as t };
var _once = null;
export { _once as once };

var _typeSuite = typeSuite0();

export { _typeSuite as typeSuite0 };
export function getTypeSuite0() {
  var _typeSuite2 = typeSuite0();

  return _typeSuite2;
}

var _checkerSuite = checkerSuite0();

export { _checkerSuite as checkerSuite0 };
export function getCheckerSuite0() {
  var _checkerSuite2 = checkerSuite0();

  return _checkerSuite2;
}