import {objForeach, getType, assert} from '../utils'

/**
 * 数字相关的model update 操作符。
 * 实现简单 加减乘除
 */
export default objForeach({

  '$+': (number, [arg]) => number + parseFloat(arg),
  '$-': (number, [arg]) => number - parseFloat(arg),
  '$*': (number, [arg]) => number * parseFloat(arg),
  '$/': (number, [arg]) => number / parseFloat(arg),
  '$%': (number, [arg]) => number % parseFloat(arg),
  '$-x': (number, [arg]) => parseFloat(arg) - number,
  '$/x': (number, [arg]) => parseFloat(arg) / number,
  '$%x': (number, [arg]) => parseFloat(arg) % number,

}, (operation, name, object) => {
  return (target, args) => {
    const targetType = getType(target)
    assert(targetType != 'number', 
      `%s only can operation at Number, but %s is a %s.`, name, target, targetType)

    return operation.call(object, target, args === undefined ? [] : [].concat(args))
  }
})