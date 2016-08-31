// uuid
function S4 () { 
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1)
}
export function createUuid () {
  // then to call it, plus stitch in '4' in the third group
  return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + 
    "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase()
}

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
 * @param  {Object}   object   Object, 最好是一个纯对象
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
 * 判读是否为 undefined 或者 null
 * @param  {object} object
 * @return {boolean}
 */
export function empty (object) {
  return object === undefined || object === null
}

/**
 * 转化成驼峰个是 good-day => goodDay
 * @param  {string} string
 * @return {string}
 */
export function camelize (string) { 
  return string.replace(/-+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
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
    if (object && object.hasOwnProperty(key)) object = object[key]
    else return
  }
  return object
}

/**
 * 通过对应path 创建对象数据
 * @param  {string} path
 * @param  {any}    最终对象的值
 * @return {object}
 */
export function pathToObject (path, value) {
  if (!path) return value
  path = path.split('.')
  let object, current, key
  current = object = {}
  while(key = path.shift()) {
    let match = key.match(/^\$(\d+)$/)
    if (match) {
      key = parseInt(match[1])
      current = current['$update'] = {}
    }
    if (path.length) {
      current = current[key] = {}
    } else {
      current[key] = value
    }
  }
  return object
}

const _requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (fn => setTimeout(fn, 16))

let nextTickList = []

function doNextTick (one) {
  while(one = nextTickList.shift()) {
    let [fn, context] = one
    try {
      context ? fn.call(context) : fn()
    } catch (e) {}
  }
}

/**
 * 下一时刻触发
 * @param  {function} fn
 * @return
 */
export function nextTick (fn, context) {
  if (nextTickList.push([fn, context]) === 1) _requestAnimationFrame(doNextTick)
}

/**
 * 深度拷贝对象
 * @param  {any} object
 * @return {any}
 * checkObjectKey 用于 model中检测key的合法性
 */
export function deepCopy (object, checkObjectKey) {
  switch (getType(object)) {
    case 'object':
      return objForeach(object, (one, key) => {
        if (checkObjectKey) checkObjectKey(key)
        return deepCopy(one, checkObjectKey)
      })
    case 'array':
      return object.map(one => deepCopy(one, checkObjectKey))
    default: return object
  }
}

/**
 * 错误处理
 * @param  {bool} expression
 * @param  {sting} message
 * @return
 */
export function assert (expression, message) {
  let index = 2
  if (expression) {
    throw new Error('Akatsuki: ' + message.replace(/%s/g, () =>
      assert.value(arguments[index++])))
  }
}
assert.value = (value) => {
  try { return JSON.stringify(value) } catch (e) { return value + '' }
}

/**
 * 创建自定义事件的eventObject
 * @param  {string} type
 * @param  {any}    detail
 * @return {eventObject}
 */
export function createCustomEventObject (type, detail) {
  if (window.CustomEvent) return new CustomEvent(type, {detail: detail})
  let event
  try {
    event = document.createEvent('CustomEvent')
    event.initCustomEvent(type, true, true, detail)
  } catch (e) {
    event = document.createEvent('Event')
    event.initEvent(type, true, true)
    event.detail = eventInitDict.detail
  }
  return event
}
