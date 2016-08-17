import {objForeach, getType} from '../utils'

export default objForeach({

  $push (array, pushArray=[]) {
    return array.concat(pushArray)
  },

  $pop (array, popCount=1) {
    return array.slice(0, -popCount)
  },

  $unshift (array, unshiftArray=[]) {
    return unshiftArray.concat(array)
  },

  $shift (array, shiftCount=1) {
    return array.slice(shiftCount)
  },

  $splice
}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'array') throw `${name} 必须是个数组才可以`
    return operation(target, args)
  }
})