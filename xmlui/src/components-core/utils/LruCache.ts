// ====================================================================================================================
// Types to implement an LRU cache we use to provide stable
// Implementation source: https://www.nickang.com/2021-11-28-how-to-implement-an-lru-cache-in-javascript/

/**
 * A single node of the LRU cache
 */
class DoublyLinkedNode {
  prev: DoublyLinkedNode | undefined;
  next: DoublyLinkedNode | undefined;
  constructor(public readonly value: any, public readonly key: string) {
    this.next = undefined;
    this.prev = undefined;
  }
}

/**
 * We keep values in the LRU cache in a doubly linked list
 */
class DoublyLinkedList {
  head: DoublyLinkedNode | undefined;
  tail: DoublyLinkedNode | undefined;
  size = 0;
  constructor() {
    this.head = undefined;
    this.tail = undefined;
    this.size = 0;
  }

  /**
   * Adds a new node to the head of the list
   * @param node The node to add to head of list
   */
  unshift(node: DoublyLinkedNode) {
    // case 1: there is only a root node in the list
    //    point node.prev to root node
    //    point node.next to undefined
    //    point DoublyLinkedList head to node
    //    point DoublyLinkedList tail to node
    //    increment DoublyLinkedList size by 1
    // case 2: there are data nodes in the list
    //    point head node.prev to node
    //    point node.next to head node
    //    point node.prev to root node
    //    point DoublyLinkedList head to node
    //    increment DoublyLinkedList size by 1

    if (this.size === 0) {
      // case 1
      this.head = node;
      this.tail = node;
      this.size++;
    } else {
      // case 2
      this.head!.prev = node;
      node.next = this.head;
      node.prev = undefined;
      this.head = node;
      this.size++;
    }
  }

  /**
   * Remove least recently used node from tail
   */
  pop() {
    const node = this.tail;
    if (!node) {
      return undefined;
    } else if (this.head === this.tail) {
      this.head = undefined;
      this.tail = undefined;
    } else {
      this.tail!.prev!.next = undefined;
    }
    this.tail = node.prev;
    this.size--;
    return node;
  }

  /**
   * Moves the specified node to the head
   */
  moveToHead(node: DoublyLinkedNode) {
    if (node === this.head) {
      return;
    }

    if (node === this.head && node === this.tail) {
      return;
    }

    if (node === this.tail) {
      // set tail to tail node.prev
      this.tail = this.tail.prev;
      // set new tail node.next to undefined
      this.tail!.next = undefined;
      // set node.next to current head
      node.next = this.head;
      // set current head node.prev to node
      this.head!.prev = node;
      // set head to node
      this.head = node;
      // set node.prev to undefined
      node.prev = undefined;
    } else {
      // set node.prev.next to node.next
      node.prev!.next = node.next;
      // set node.next.prev to node.prev
      node.next!.prev = node.prev;
      // set node.next to current head
      node.next = this.head;
      // set current head node.prev to node
      this.head!.prev = node;
      // set node as new head
      this.head = node;
      // set node.prev to undefined
      node.prev = undefined;
    }
  }
}

/**
 * This class implements the LRU cache
 */
export class LRUCache {
  private store: Record<string, DoublyLinkedNode> = {};
  list = new DoublyLinkedList();
  constructor(public readonly maxSize: number) {}

  /**
   * Gets the number of items stored in the cache
   */
  get length(): number {
    return this.list.size;
  }

  /**
   * Gets the value with the specified key
   * @param key
   */
  get(key: string): any {
    // case 1: node with this key found
    //    update position of node to head of DoublyLinkedList
    //    return existing node
    // case 2: node with this key not found (i.e. doesn't exist)
    //    return undefined

    const existingNode = this.store[key];
    if (existingNode) {
      this.list.moveToHead(existingNode);
    }
    return existingNode?.value;
  }

  /**
   * Sets the value for a particular key within the cache
   * @param key Cache item key
   * @param value Cache item value
   */
  set(key: string, value: any): void {
    // case 1: search and found existing node with this key
    //    use get() to obtain node
    //    if not exist, go to case 2
    //    if exist, let get() handle re-ordering in DoublyLinkedList
    //        set node to hold new value
    const existingNode = this.get(key);
    if (existingNode) {
      existingNode.value = value;
    }

    // case 2: search and couldn't find existing node with this key
    //    create new node
    //    insert key-value pair into store
    //    insert as new head of DoublyLinkedList

    const newNode = new DoublyLinkedNode(value, key);
    this.store[key] = newNode;
    this.list.unshift(newNode);

    if (this.hasReachedMaxSize()) {
      this.evictLeastRecentlyUsed();
    }
  }

  hasReachedMaxSize() {
    return this.list.size === this.maxSize + 1;
  }

  evictLeastRecentlyUsed() {
    const evictedNode = this.list.pop();
    delete this.store[evictedNode!.key];
  }
}
