import { beforeEach, describe, expect, it } from "vitest";
import { LRUCache } from "@components-core/utils/LruCache";

describe("LRUCache", () => {
  let lru: LRUCache;
  beforeEach(() => {
    lru = new LRUCache(5);
  });

  it.skip("puts most recently added item to front of list", () => {
    // note: can't test using lru.get() as that will mess up ordering
    //       reach into the internals directly instead
    lru.set("nick", "nick val 1");
    expect(lru!.list!.head!.value).to.equal("nick val 1");
    lru.set("char", "char val 1");
    expect(lru.list!.head!.value).to.equal("char val 1");
    lru.set("nick", "nick val 2");
    expect(lru.list!.head!.value).to.equal("nick val 2");
  });

  it("puts most recently accessed item to front of list", () => {
    // note: can't test using lru.get() as that will mess up ordering
    //       reach into the internals directly instead
    lru.set("nick", "nick val 1");
    lru.set("char", "char val 1");
    lru.set("brow", "brow val 1");
    lru.set("lane", "lane val 1");
    lru.get("nick");
    expect(lru.list!.head!.value).to.equal("nick val 1");
    lru.get("char");
    expect(lru.list!.head!.value).to.equal("char val 1");
    lru.get("lane");
    expect(lru.list!.head!.value).to.equal("lane val 1");
    lru.get("brow");
    expect(lru.list!.head!.value).to.equal("brow val 1");
    lru.get("brow");
    expect(lru.list!.head!.value).to.equal("brow val 1");
  });

  it.skip("keeps track of size correctly", () => {
    lru.set("nick", "nick val 1");
    expect(lru.list.size).to.equal(1);
    lru.set("char", "char val 1");
    expect(lru.list.size).to.equal(2);
    lru.set("char", "char val 2");
    expect(lru.list.size).to.equal(2);

    lru.set("bowie", "bowie val 1");
    lru.set("david", "david val 1");
    lru.set("dobrick", "dobrick val 1");
    expect(lru.list.size).to.equal(5);
  });

  it("evicts the last item in list when max size is reached", () => {
    lru.set("nick", 1);
    lru.set("bob", 2);
    lru.set("dylan", 3);
    lru.set("jonny", 4);
    lru.set("depth", 5);
    lru.set("shtick", 6);
    expect(lru.get("nick")).to.equal(undefined);
    expect(lru.get("bob")).not.to.equal(undefined);
  });
});
