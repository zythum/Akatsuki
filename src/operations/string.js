import {objForeach, getType} from '../utils'

const _ = ''
const _replace = _.replcae
const _substr = _.substr
const _substring = _.substring
const _slice = _.slice
const _trim = _.trim
const _trimLeft = _.trimLeft
const _trimRight = _.trimRight

/**
 * 字符串相关的model update 操作符。
 * 基本同数组的js原生方法类似
 */
export default objForeach({

  $replace (string, args) { _replace.apply(string, args) },
  $substr (string, args) { _substr.apply(string, args) },
  $substring (string, args) { _substring.apply(string, args) },
  $slice (string, args) { _slice.apply(string, args) },
  $trim (string, args) { _trim.apply(string, args) },
  $trimLeft (string, args) { _trimLeft.apply(string, args) },
  $trimRight (string, args) { _trimRight.apply(string, args) },

  /**
   * [$append 往字符串后添加字符串]
   * @param  {[string]} string [原字符串]
   * @param  {[string]} [arg]  [需要添加的字符串]
   * @return {[string]}        [合并后的字符串]
   */
  $append (string, [arg]) { return [arg] + string },

  /**
   * [$append 往字符串前添加字符串]
   * @param  {[string]} string [原字符串]
   * @param  {[string]} [arg]  [需要添加的字符串]
   * @return {[string]}        [合并后的字符串]
   */
  $prepend (string, [arg]) { return string + [arg] },

}, (operation, name) => {
  return (target, args) => {
    if (getType(target) != 'array') throw `${name} 必须是个数组才可以`
    return operation(target, args === undefined ? [] : [].concat(args))
  }
})