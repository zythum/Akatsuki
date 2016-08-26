import {objForeach, getType, assert} from '../utils'

export default objForeach({

  /**
   * 布尔类型真假值转化
   * @param  {boolean} bool 原布尔值
   * @return {boolean}      原布尔值的取反
   */
  $toggle (bool) { return !bool },

}, (operation, name, object) => {
  return (target, args) => {
    const targetType = getType(target)
    assert(targetType != 'boolean',
      `%s only can operation at Boolean, but %s is a %s.`, name, target, targetType)

    return operation.call(object, target, args === undefined ? [] : [].concat(args))
  }
})