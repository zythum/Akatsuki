import {objForeach, getType, toStr} from '../utils'


function _apply (instance, methodName, args) {
  return instance['methodName'].apply(instance, args)
}

export default objForeach({

  // string自有方法
  replace   (string, args) { return _apply(string, 'replace',   args) },
  substr    (string, args) { return _apply(string, 'substr',    args) },
  substring (string, args) { return _apply(string, 'substring', args) },
  slice     (string, args) { return _apply(string, 'slice',     args) },

  trim      (string, args) { return string.trim() },
  trimLeft  (string, args) { return string.trimLeft() },
  trimRight (string, args) { return string.trimRight() },

  // string前添加字符串
  prefix (string, [arg]) { return '' + arg + string },
  // string后添加字符串
  suffix (string, [arg]) { return '' + string + arg },

}, (formatter, name, object) => {
  return (target, args) => {
    args = args.map(arg => getType(arg) === 'function' ? arg() : arg)
    return formatter.call(object, target + '', args)
  }
})