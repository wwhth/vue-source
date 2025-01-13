var maxAltitude = function(heights, limit) {
    let res = []
    // for(let i = 0;i++;i<heights.length -limit){
    debugger
    // }
    let i = 0;
    while(i+limit <= heights.length){
        let arr =heights.slice(i,limit+i)
        res.push(Math.max(...arr))
        i++
    }
    return res
};


var maxAltitude2 = function(heights, limit) {
    let dequeue = [], len = heights.length, res = []
    for(let i = 0; i <len; i++) {
        // 打破递减趋势 删掉直到恢复递减趋势
        while(dequeue.length && heights[i] > heights[dequeue[dequeue.length - 1]]) {
            dequeue.pop()
        }
        dequeue.push(i)
        // 滑动窗口滑动时删除头部
        while(dequeue.length && dequeue[0] <= i-limit) {
            dequeue.shift()
        }
        if (i >= limit-1) {
            res.push(heights[dequeue[0]])
        }
    }
    return res
};

console.log(maxAltitude([5,3,4,4,7,3,6,11,8,5,11],2))