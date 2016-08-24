import {objForeach, getType} from '../utils'

export default objForeach({

  toString (value, args) {
    if (value && value.toString) 
      return value.toString.apply(value, args)
    return value
  },

  // 返回数据的length 如果是对象返回 keys.length
  count (object) {
    if (typeof object != 'object') return 0
    if ('length' in object) return object.length
    if (typeof object === 'object') return Object.keys(object).length
    return 0
  },

  // 如果object 不存在或者 count是0
  empty (object) {
    if (typeof object === 'object') {
      if ('length' in object) return object.length === 0
      if (typeof object === 'object') return Object.keys(object).length === 0
    }
    return !object
  },
  
  // empty的取反
  '!empty' (object) {
    return !this.empty(object)
  },

  '<':   (value, [arg]) => value <   arg,
  '<=':  (value, [arg]) => value <=  arg,
  '==':  (value, [arg]) => value ==  arg,
  '===': (value, [arg]) => value === arg,
  '>=':  (value, [arg]) => value >=  arg,
  '>':   (value, [arg]) => value >   arg,
  '!=':  (value, [arg]) => value !=  arg,
  '!==': (value, [arg]) => value !== arg,

  // 如果value 是空 则返回默认值的操作
  '??': (value, [arg]) => {
    return value === undefined || value === null ? arg : value
  }

}, (formatter, name, object) => {
  return (target, args) => {
    args = args.map(arg => getType(arg) === 'function' ? arg() : arg)
    return formatter.call(object, target, args)
  }
})