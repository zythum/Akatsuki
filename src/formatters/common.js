import {objForeach, getType} from '../utils'

export default objForeach({

  toString (value, args) {
    if (value && value.toString) 
      return value.toString.apply(value, args)
    return value
  },

  count (obj) {
    if ('length' in obj) return obj.length
    if (typeof obj === 'object') return Object.keys(obj)
    return 0
  },

  empty (obj) {
    if ('length' in obj) return obj.length === 0
    if (typeof obj === 'object') return Object.keys(obj) === 0
    return !obj
  },
  
  '!empty' (obj) {
    return !this.empty(obj)
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

}, (formatter, name, object) => {
  return (target, args) => {
    return formatter.call(object, target, args === undefined ? [] : [].concat(args))
  }
})