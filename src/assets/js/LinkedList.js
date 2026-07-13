import LinkedListNode from "./LinkedListNode";

export default class LinkedList {
  // current , next , perv , first , last , insert ,remove

  constructor(nodes) {
    this.list = [];
    this.first = null;
    this.last = null;
    this.current = null;
    this.length = 0;
    if (!nodes) {
      return true;
    }

    nodes.forEach((element) => {
      this.list.push(element);
      this.push(element);
    });
  }

  push(value) {
    this.length++;

    const newNode = new LinkedListNode(value, this.last);
    if (this.last) {
      this.last.next = newNode;
      this.last = newNode;
      return newNode;
    }

    this.first = this.current = this.last = newNode;
    return newNode;
  }

  pop() {
    if (this.last) {
      const last = this.last;
      const newLast = last.prev;
      newLast.next = null;
      this.last = newLast;

      return last;
    }

    return null;
  }

  firts() {
    return this.first;
  }

  last() {
    return this.last();
  }

  next() {
    if (!this.current || !this.current.next) {
      return false;
    }

    this.current = this.current.next;
    return this.current;
  }
  prev() {
    if (this.first === this.current) {
      return false;
    }

    this.current = this.current.prev;
    return this.current;
  }

  moveTo(nodeTitle) {
    if (this.first == null) {
      return;
    }
    let testNode = this.first;

    while (nodeTitle != testNode.value.title && testNode.next != null) {
      testNode = testNode.next;
    }

    if (nodeTitle == testNode.value.title) {
      this.current = testNode;
    }
  }
}
