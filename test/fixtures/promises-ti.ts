export const ILRUCache = t.iface([], [
  t.prop("capacity", "number"),
  t.prop("isReady", "boolean"),
  t.prop("set", t.func("boolean", t.param("item", "ICacheItem"), t.param("overwrite", "boolean", true))),
  t.prop("get", t.func("ICacheItem", t.param("key", "string"))),
]);
