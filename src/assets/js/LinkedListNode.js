export default class LinkedListNode {
  constructor(value, prev, next = null) {
    this.value = value;
    this.prev = prev;
    this.next = next;
  }
}
