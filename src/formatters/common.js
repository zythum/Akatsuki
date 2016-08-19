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

  '?' : (value, args) => {
    let [trueValue, sign, falseValue] = args
    if (args.legnth != 3 || sign != ':') throw "? x : y 的三元运算符格式不对"
    return !!value ? trueValue : falseValue
  },

  '??': (value, [arg]) => {
    return value === undefined || value === null ? arg : value
  }

}, (formatter, name) => {
  return (target, args) => {
    return formatter(target, args === undefined ? [] : [].concat(args))
  }
})