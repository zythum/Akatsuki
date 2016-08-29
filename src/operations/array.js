import {objForeach, getType, assert} from '../utils'

const _ = []
const _slice = _.slice
const _splice = _.splice
/**
 * 数组相关的model update 操作符。
 * 基本同数组的js原生方法类似
 * ⚠️ 这边添加操作符注意，返回一定是个数组，并且不要修改传入的数组。
 */
export default objForeach({

  $push (array, [item]) { return array.concat([item]) },
  $pop (array) { return array.slice(0, -1) },
  $unshift (array, [item]) { return [item].concat(array) },
  $shift (array) { return array.slice(1) },
  $arraySlice (array, args) { return _slice.apply(array, [].concat(args)) },
  $splice (array, args) {
    array = [].concat(array)
    _splice.apply(array, [].concat(args))
    return array
  },
  $reverse (array) { return [].concat(array).reverse() },
  $sort (array, [iteratee]) { return [].concat(array).sort(iteratee) },
  $filter (array, [iteratee]) { return array.filter(iteratee)},
  $map (array, [iteratee]) { return array.map(iteratee)},

  /**
   * 删除数组中对应index的元素
   * @param  {array} array 原数组
   * @param  {array} args  需要删除的数组对应的index数组
   * @return {array}       去掉了需要删除数组的原数组拷贝
   *
   * $remove([1,2,3,4], [1,2]) == [1,4]
   */
  $remove (array, args) {
    const map = {}
    args.forEach(idx => map[parseInt(idx)] = 1)
    array = [].concat(array)
    for (let idx = 0, len = array.length, removeCout = 0; idx < len; idx++) {
      if ( (idx + removeCout) in map ) {
        array.splice(idx, 1)
        ++removeCout, --idx, --len
      }
    }
    return array
  },

}, (operation, name, object) => {
  return (target, args) => {
    const targetType = getType(target)
    assert(targetType != 'array',
      `%s only can operation at Array, but %s is a %s.`, name, target, targetType)

    return operation.call(object, target, args === undefined ? [] : [].concat(args))
  }
})