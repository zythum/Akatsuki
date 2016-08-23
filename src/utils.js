/**
 * 空方法
 * @return {undefined} 
 */
export function noop () {}

//获取对象类型
let class2type = {}
let _toString = class2type.toString
;'Boolean Number String Function Array Date RegExp Object Error'.split(' ')
  .forEach( item => class2type[`[object ${item}]`] = item.toLowerCase() )

/**
 * 获取数据类型
 * @param  {any}
 * @return {string}
 *
 * 数据类型包括: boolean number string function array date regexp object error
 */
export function getType (object) {
  if (object === null) return object + ''
  let type = typeof object
  return type === 'object' || type === 'function' ?
    class2type[_toString.call(object)] || 'object' : type
}

/**
 * 循环对象元素
 * @param  {Object}   object      Object, 最好是一个纯对象
 * @param  {Function} iteratee 循环函数
 * @return {Object}            类似Array.map 将 iteratee 返回的数据组成新对象
 */
export function objForeach (object, iteratee) {
  let result = {}
  for (let key in object) {
    //如果是 Object.create(null) 创建的纯对象是没有 hasOwnProperty 的
    if (object.hasOwnProperty == undefined || object.hasOwnProperty(key))
      result[key] = iteratee(object[key], key, object)
  }
  return result
}

/**
 * 遍历dom， 遍历自身开始的内部以及以下的兄弟节点（包括自己）
 * @param  {element}  element  
 * @param  {function} iteratee 如果返回是false, 停止继续往深度遍历
 */
export function walkChild (element, iteratee) {
  if (element) {
    walkChild(element.nextSibling, iteratee)
    if (iteratee(element) != false)
      walkChild(element.firstChild, iteratee)
  }
}

/**
 * 遍历dom， 遍历自身开始的内部的节点（包括自己）
 * @param  {element}  element  
 * @param  {function} iteratee 如果返回是false, 停止继续往深度遍历
 */
export function walk (element, iteratee) {
    if (iteratee(element) != false) walkChild(element.firstChild, iteratee)
}

/**
 * 获取对应path 下的对象数据
 * @param  {object}  object          获取的对象
 * @param  {stringOrArray}  path     获取的path
 * @param  {boolean} parseNumber  是否把 $0 $1 认为是数字
 * @return {any or undefined}
 */
export function objectValueFromPath (object, path, parseNumber) {  
  if (getType(path) === 'string') {
    if (path === '') return object  
    path = path.split('.')
  }
  for (let key of path) {
    if (parseNumber) {
      let match = key.match(/^\$(\d+)$/)
      if (match) {
        key = parseInt(match[1])
        if (getType(object) === 'array') object = object[key]
        else return
        continue
      }
    }
    if (object.hasOwnProperty(key)) object = object[key]
    else return
  }
  return object
}

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * 例子： 
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
 */
export function dateFormat (date, fmt) {
  var o = {
    'M+': date.getMonth() + 1, //月份 
    'd+': date.getDate(), //日 
    'h+': date.getHours(), //小时 
    'm+': date.getMinutes(), //分 
    's+': date.getSeconds(), //秒 
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度 
    'S': date.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) 
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) 
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? 
        (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
  return fmt
}

const _requestAnimationFrame = 
  window.requestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.msRequestAnimationFrame || 
  (fn => setTimeout(fn, 16))

/**
 * 下一时刻触发
 * @param  {function} fn
 * @return
 */
export function nextTick (fn) { _requestAnimationFrame(fn) }
