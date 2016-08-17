import {objForeach, getType} from '../utils'

export default objForeach({

  $insertBefore (string, arg) {
    return arg + string
  },

  $insertAfter (string, arg) {
    return string + arg
  },

}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'array') throw `${name} 必须是个数组才可以`
    return operation(target, args)
  }
})