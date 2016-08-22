import {objForeach, getType} from '../utils'

export default objForeach({

  /**
   * 自定义执行
   * @param  {not obejct}     target 之前的属性
   * @param  {function }      [fn]   处理函数，处理target为return 值，但是注意，处理完必须和之前的类型一致
   * @return {same as target}        处理函数的return
   */
  exec: function (target, [fn]) { 
    const type = getType(target)
    if (getType(target) === 'object') throw '$exec 必须不是个对象才可以'
    if (getType(fn) != 'function') throw '$exec 参数必须是一个function'
    if (type === 'array') target = [].concat(target)

    let result = fn.call(null, target) 
    if (type === getType(result)) return result
    throw '$exec中, 处理函数必须入参和返回值类型一致'
  }

}, (operation, name, object) => {
  return (target, args) => operation.call(object, target, args === undefined ? [] : [].concat(args))
})