import * as t from "ts-interface-checker";

export const ILRUCache = t.iface([], {
  "capacity": "number",
  "isReady": "boolean",
  "set": t.func("boolean", t.param("item", "ICacheItem"), t.param("overwrite", "boolean", true)),
  "get": t.func("ICacheItem", t.param("key", "string")),
});
