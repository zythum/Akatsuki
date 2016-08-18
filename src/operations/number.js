import {objForeach, getType} from '../utils'

/**
 * 数字相关的model update 操作符。
 * 实现简单 加减乘除
 */
export default objForeach({

  '$+': (number, [arg]) => number + parseFloat(arg),
  '$-': (number, [arg]) => number - parseFloat(arg),
  '$*': (number, [arg]) => number * parseFloat(arg),
  '$/': (number, [arg]) => number / parseFloat(arg),
  '$-x': (number, [arg]) => parseFloat(arg) - number,
  '$/x': (number, [arg]) => parseFloat(arg) / number,

}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'array') throw `${name} 必须是个数字才可以`
    return operation(target, args === undefined ? [] : [].concat(args))
  }
})