export async function mapWithConcurrency<T, R>(
  arr: T[],
  concurrency: number,
  fn: (item: T, idx: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(arr.length);
  let i = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= arr.length) break;
      out[idx] = await fn(arr[idx], idx);
    }
  }
  const workers = Array(Math.min(concurrency, arr.length)).fill(0).map(worker);
  await Promise.all(workers);
  return out;
}
