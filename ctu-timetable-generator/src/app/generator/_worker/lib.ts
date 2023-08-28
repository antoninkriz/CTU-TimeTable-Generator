const END_NODE = {} as LinkedListNode<never>;

export class LinkedListNode<T> {
  pre: LinkedListNode<T>;

  next: LinkedListNode<T>;

  value: T;

  constructor(value: T, pre: LinkedListNode<T> = END_NODE, next: LinkedListNode<T> = END_NODE) {
    this.value = value;
    this.pre = pre;
    this.next = next;
  }
}

export class LinkedList<T> {
  private head: LinkedListNode<T>;

  constructor() {
    this.head = END_NODE;
  }

  isEmpty() {
    return this.head === END_NODE;
  }

  begin() {
    return this.head;
  }

  end() {
    return END_NODE;
  }

  insertAfter(value: T, node: LinkedListNode<T>) {
    const nodeNew: LinkedListNode<T> = {
      pre: node,
      next: node === END_NODE ? END_NODE : node.next,
      value,
    };

    if (node !== END_NODE) {
      if (node.next !== END_NODE) {
        node.next.pre = nodeNew;
      }
      node.next = nodeNew;
    } else if (node === this.head) {
      this.head = nodeNew;
    }

    return nodeNew;
  }

  insertBefore(value: T, node: LinkedListNode<T>) {
    const nodeNew: LinkedListNode<T> = {
      pre: node === END_NODE ? END_NODE : node.pre,
      next: node,
      value,
    };

    if (node === this.head) {
      this.head = nodeNew;
    }

    if (node !== END_NODE) {
      if (node.pre !== END_NODE) {
        node.pre.next = nodeNew;
      }
      node.pre = nodeNew;
    }

    return nodeNew;
  }

  remove(node: LinkedListNode<T>) {
    if (node === END_NODE) return;

    if (node === this.head) {
      this.head = node.next;
    }

    const { pre, next } = node;
    if (pre !== END_NODE) {
      pre.next = next;
    }
    if (next !== END_NODE) {
      next.pre = pre;
    }
  }

  * [Symbol.iterator]() {
    let node = this.begin();
    while (node !== END_NODE) {
      yield node;
      node = node.next;
    }
  }
}

export class ProgressMeter {
  private readonly reportLevel: number;

  private readonly callback: (n: number) => void;

  private n: number;

  constructor(reportLevel: number, callback: (n: number) => void) {
    this.reportLevel = reportLevel;
    this.callback = callback;
    this.n = 0;
  }

  increment(n: number) {
    const oldN = this.n;
    this.n += n;

    if (
      n >= this.reportLevel
      || ((oldN % this.reportLevel) + n) >= this.reportLevel
    ) {
      this.callback(this.n);
    }
  }
}
