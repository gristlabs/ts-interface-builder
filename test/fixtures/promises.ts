interface ILRUCache {
  capacity: number;
  isReady: Promise<boolean>;
  set(item: ICacheItem, overwrite?: boolean): Promise<boolean>;
  get(key: string): Promise<ICacheItem>;
}
