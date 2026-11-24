/** Min-heap generik berbasis array. Dipakai sebagai priority queue pada Dijkstra. */
export class MinHeap<T> {
  private items: { priority: number; seq: number; value: T }[] = [];
  private counter = 0;

  get size(): number {
    return this.items.length;
  }

  push(value: T, priority: number): void {
    // seq menjaga urutan stabil ketika prioritas sama (FIFO).
    this.items.push({ priority, seq: this.counter++, value });
    this.siftUp(this.items.length - 1);
  }

  pop(): { value: T; priority: number } | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }
    return { value: top.value, priority: top.priority };
  }

  private less(a: number, b: number): boolean {
    const x = this.items[a];
    const y = this.items[b];
    return x.priority < y.priority || (x.priority === y.priority && x.seq < y.seq);
  }

  private swap(a: number, b: number): void {
    [this.items[a], this.items[b]] = [this.items[b], this.items[a]];
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(i, parent)) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private siftDown(i: number): void {
    const n = this.items.length;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let smallest = i;
      if (l < n && this.less(l, smallest)) smallest = l;
      if (r < n && this.less(r, smallest)) smallest = r;
      if (smallest === i) break;
      this.swap(i, smallest);
      i = smallest;
    }
  }
}
