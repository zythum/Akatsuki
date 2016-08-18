import {objForeach, getType} from '../utils'

export default objForeach({

  /**
   * [$toggle 布尔类型真假值转化]
   * @param  {[boolean]} bool 原布尔值
   * @return {[boolean]}      原布尔值的取反
   */
  $toggle (bool) { return !bool },

}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'boolean') throw `${name} 必须是个布尔才可以`
    return operation(target, args === undefined ? [] : [].concat(args))
  }
})