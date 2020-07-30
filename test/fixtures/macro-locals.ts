import {makeCheckers} from "../../macro";

interface LocalInterface {
  foo: number;
}

export function checkLocalInterface(input: any): LocalInterface {
  // shows that t is renamed
  const t = makeCheckers(undefined, {inlineImports: false});
  t.LocalInterface.check(input);
  return input as LocalInterface;
}

function t(t: any) {
  // shows function t is renamed and argument t is not
  return t;
}

void t
