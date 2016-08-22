import {objForeach, getType, toStr} from '../utils'

export default objForeach({

  replace (string, args) { return string.replace.apply(string, args) },
  substr (string, args) { return string.substr.apply(string, args) },
  substring (string, args) { return string.substring.apply(string, args) },
  slice (string, args) { return string.slice.apply(string, args) },
  trim (string, args) { return string.trim() },
  trimLeft (string, args) { return string.trimLeft() },
  trimRight (string, args) { return string.trimRight() },

  prefix (string, [arg]) { return '' + arg + string },
  suffix (string, [arg]) { return '' + string + arg },

}, (formatter, name, object) => {
  return (target, args) => {
    args = args.map(arg => getType(arg) === 'function' ? arg() : arg)
    return formatter.call(object, target + '', args)
  }
})