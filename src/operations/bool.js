import {objForeach, getType} from '../utils'

export default objForeach({

  $toggle (bool) { return !bool },

}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'boolean') throw `${name} 必须是boolean才可以`
    return operation(target, args)
  }
})