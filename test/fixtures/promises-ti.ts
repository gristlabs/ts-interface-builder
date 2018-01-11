import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const ILRUCache = t.iface([], {
  "capacity": "number",
  "isReady": "boolean",
  "set": t.func("boolean", t.param("item", "ICacheItem"), t.param("overwrite", "boolean", true)),
  "get": t.func("ICacheItem", t.param("key", "string")),
});

const exportedTypeSuite: t.ITypeSuite = {
  ILRUCache,
};
export default exportedTypeSuite;
