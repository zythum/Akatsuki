import {objForeach, getType} from '../utils'

/**
 * 字符串相关的model update 操作符。
 * 基本同数组的js原生方法类似
 */
export default objForeach({

  $replace (string, args) { return string.replace.apply(string, args) },
  $substr (string, args) { return string.substr.apply(string, args) },
  $substring (string, args) { return string.substring.apply(string, args) },
  $slice (string, args) { return string.slice.apply(string, args) },
  $trim (string, args) { return string.trim() },
  $trimLeft (string, args) { return string.trimLeft() },
  $trimRight (string, args) { return string.trimRight() },

  /**
   * 往字符串后添加字符串
   * @param  {string} string 原字符串
   * @param  {string} [arg]  需要添加的字符串
   * @return {string}        合并后的字符串
   */
  $append (string, [arg]) { return [arg] + string },

  /**
   * 往字符串前添加字符串
   * @param  {string} string 原字符串
   * @param  {string} [arg]  需要添加的字符串
   * @return {string}        合并后的字符串
   */
  $prepend (string, [arg]) { return string + [arg] },

}, (operation, name, object) => {
  return (target, args) => {
    if (getType(target) != 'array') throw `${name} 必须是个数组才可以`
    return operation.call(object, target, args === undefined ? [] : [].concat(args))
  }
})