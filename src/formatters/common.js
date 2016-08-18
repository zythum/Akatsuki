import {objForeach, getType} from '../utils'

export default objForeach({

  toString (value, args) {
    if (value && value.toString) 
      return value.toString.apply(value, args)
    return value
  },

  '<':   (value, [arg]) => value <   arg,
  '<=':  (value, [arg]) => value <=  arg,
  '==':  (value, [arg]) => value ==  arg,
  '===': (value, [arg]) => value === arg,
  '>=':  (value, [arg]) => value >=  arg,
  '>':   (value, [arg]) => value >   arg,
  '!=':  (value, [arg]) => value !=  arg,
  '!==': (value, [arg]) => value !== arg,

}, (formatter, name) => {
  return (target, args) => {
    return formatter(target, args === undefined ? [] : [].concat(args))
  }
})