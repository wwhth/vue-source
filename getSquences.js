// 最长递增子序列
// [1, 2, 3, 5, 4, 9, 7, 8, 6]
const getSequences = (arr) => {
  debugger
  const result = [0]
  const p = result.slice(0) // 前一个节点的索引
  let start
  let end
  let mid
  const len = arr.length //数组长度
  for (let i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      //vue3中0代表没有patch到的
      // 拿到result中最后一个元素，也就是当前最长递增子序列的最后一个元素，和当前元素比较
      const last = result[result.length - 1]
      if (arrI > arr[last]) {
        p[i] = last // 正产放入的情况下，前一个节点索引就是result的最后一个
        console.log("🚀 ~ getSequences ~ arrI:", arrI, arr[last], last)
        // 如果当前元素比最长递增子序列的最后一个元素大，则将当前元素添加到最长递增子序列中
        result.push(i)
        console.log("🚀 ~ getSequences ~ result:", result)
        continue
      }
      // 如果当前元素比最长递增子序列的最后一个元素小，则使用二分查找找到最长递增子序列中第一个大于当前元素的位置，并替换掉该位置的元素
      start = 0
      end = result.length - 1
      while (start < end) {
        mid = ((start + end) / 2) | 0

        // mid = (start + end) >> 1
        if (arr[result[mid]] < arrI) {
          start = mid + 1
        } else {
          end = mid
        }
      }
    }
    if (arrI < arr[result[start]]) {
      debugger
      p[i] = result[start - 1] //找到的那个节点的前一个
      result[start] = i
      console.log("🚀 ~ getSequences ~ result:", result)
    }
    console.log("🚀 ~ getSequences ~ p:", p)
  }
  // p为前驱节点的列表，需要根据最后一个字节做追溯

  let l = result.length
  let last = result[l - 1]
  while (l-- > 0) {
    result[l] = last
    last = p[last] //在数组中找到最后一个
  }
  // 需要创建一个 前驱节点，进行倒序追溯 （因为最后一项，肯定是不会错的）
  return result
}
console.log(getSequences([2, 3, 1, 5, 6, 8, 7, 9, 4]))
// console.log(getSequences([1, 2, 3, 4, 5, 8, 9, 10, 6]))
