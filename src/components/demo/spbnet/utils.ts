export function findPercentile(arr: number[], percentile: number) {
  const carr = [...arr]
  carr.sort((a, b) => a - b)
  const len = arr.length
  const plen = Math.floor((percentile * len) / 100)
  return carr[plen]
}
