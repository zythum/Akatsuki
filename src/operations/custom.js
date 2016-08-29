import {objForeach, getType, deepCopy, assert} from '../utils'

export default objForeach({

  /**
   * 自定义执行
   * @param  {not obejct}     target 之前的属性
   * @param  {function }      [fn]   处理函数，处理target为return 值，但是注意，处理完必须和之前的类型一致
   * @return {same as target}        处理函数的return
   */
  $exec: function (target, [fn]) {
    const type = getType(target)
    const paramType = getType(fn)

    assert(type === 'object', '$exec can not operation at Object')
    assert(paramType != 'function', '$exec wants a param with Function, not %s is a %s.', fn, paramType)

    const result = fn.call(null, type === 'array' ? deepCopy(target) : target)
    const resultType = getType(result)
    assert(type != resultType, "$exec operations at an %s, so it wants to return a %s, but %s is a %s.",
      type, type, result, resultType)
    return result
  }

}, (operation, name, object) => {
  return (target, args) => operation.call(object, target, args === undefined ? [] : [].concat(args))
})