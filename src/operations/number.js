import {objForeach, getType} from '../utils'

export default objForeach({

  $plus (number, arg) {
    return number + parseInt(arg, 10)
  },
  $minus (number, arg) {
    return number - parseInt(arg, 10)
  },
  $multiply (number, arg) {
    return number * parseInt(arg, 10)
  },
  $divide (number, arg) {
    return number / parseInt(arg, 10)
  },

}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'array') throw `${name} 必须是个数字才可以`
    return operation(target, args)
  }
})