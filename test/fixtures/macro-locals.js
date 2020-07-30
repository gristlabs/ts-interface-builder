import * as t from "ts-interface-checker";
export function checkLocalInterface(input) {
  // shows that t is renamed
  var _t = t.createCheckers({
    LocalInterface: t.iface([], {
      "foo": "number"
    })
  });

  _t.LocalInterface.check(input);

  return input;
}

function _t2(t) {
  // shows function t is renamed and argument t is not
  return t;
}

void _t2;
